import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// リクエストにuserを追加するための型拡張
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

/**
 * JWT認証ミドルウェア
 * Authorization ヘッダーからJWTトークンを取得して検証する
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token is required',
      },
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as {
      id: string;
      email: string;
    };
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Invalid or expired token',
      },
    });
  }
}; 
