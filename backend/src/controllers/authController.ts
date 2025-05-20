import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Errors } from '../utils/errors';

// 仮の認証情報 (実際のプロジェクトではDBに保存されるもの)
const dummyUsers = [
  {
    id: uuidv4(),
    name: 'Test User',
    email: 'test@example.com',
    password: 'password', // 実際にはハッシュ化して保存
  },
];

/**
 * 認証コントローラ
 */
export const authController = {
  /**
   * ログイン処理
   */
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      
      // バリデーション
      if (!email || !password) {
        throw Errors.badRequest('Email and password are required');
      }
      
      // 仮の認証ロジック (実際のプロジェクトではDBから検索)
      const user = dummyUsers.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw Errors.unauthorized('Invalid email or password');
      }
      
      // JWTトークンの生成
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '24h' }
      );
      
      res.status(200).json({
        token,
        expiresIn: 86400, // 24時間（秒）
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * サインアップ処理
   */
  signup: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      
      // バリデーション
      if (!name || !email || !password) {
        throw Errors.badRequest('Name, email and password are required');
      }
      
      // メールアドレスの重複チェック
      const existingUser = dummyUsers.find(u => u.email === email);
      if (existingUser) {
        throw Errors.conflict('Email already in use');
      }
      
      // 新しいユーザーの作成
      const newUser = {
        id: uuidv4(),
        name,
        email,
        password, // 実際にはハッシュ化して保存
      };
      
      // 仮のユーザーリストに追加
      dummyUsers.push(newUser);
      
      // JWTトークンの生成
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '24h' }
      );
      
      res.status(201).json({
        token,
        expiresIn: 86400, // 24時間（秒）
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    } catch (error) {
      next(error);
    }
  },
}; 
