import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import { aiController } from '../controllers/aiController';

export const aiRoutes = express.Router();

// AIコンテナの起動エンドポイント
aiRoutes.post('/container/start', authenticateJWT, aiController.startContainer);

// AIコンテナの状態確認エンドポイント
aiRoutes.get('/container/:containerId/status', authenticateJWT, aiController.getContainerStatus);

// AIコンテナの停止エンドポイント
aiRoutes.post('/container/:containerId/stop', authenticateJWT, aiController.stopContainer);

// AIスクリプトのアップロードエンドポイント
aiRoutes.post('/script/upload', authenticateJWT, aiController.uploadScript);

// AIスクリプト一覧取得エンドポイント
aiRoutes.get('/scripts', authenticateJWT, aiController.getScripts); 
