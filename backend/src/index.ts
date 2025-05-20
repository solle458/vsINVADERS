import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { gameRoutes } from './routes/game';
import { authRoutes } from './routes/auth';
import { aiRoutes } from './routes/ai';
import logger from './utils/logger';
import { APIError } from './utils/errors';

// 環境変数の読み込み
dotenv.config({path: '../.env'});

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェアの設定
app.use(cors());
app.use(express.json());

// リクエストログミドルウェア
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  next();
});

// ルートの設定
app.use('/api/v1/game', gameRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/ai', aiRoutes);

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 存在しないエンドポイントのハンドリング
app.use((req, res, next) => {
  const error = new APIError(`Not found - ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
});

// エラーハンドリング
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';
  
  // エラーログの出力
  if (statusCode >= 500) {
    logger.error(`Error ${statusCode}: ${message}`, {
      errorCode,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.warn(`Error ${statusCode}: ${message}`, {
      errorCode,
      path: req.path,
      method: req.method,
    });
  }
  
  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: message,
      details: err.details || undefined
    }
  });
});

// サーバーの起動
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// プロセス終了時の処理
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

// エラーハンドリング
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
}); 
