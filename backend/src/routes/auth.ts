import express from 'express';
import { authController } from '../controllers/authController';

export const authRoutes = express.Router();

// 仮の認証情報 (実際のプロジェクトではDBに保存されるもの)
const dummyUsers = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password', // 実際にはハッシュ化して保存
  },
];

// ログインエンドポイント
authRoutes.post('/login', authController.login);

// サインアップエンドポイント
authRoutes.post('/signup', authController.signup); 
