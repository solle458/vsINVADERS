import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import { gameController } from '../controllers/gameController';

export const gameRoutes = express.Router();

// ゲーム開始エンドポイント
gameRoutes.post('/start', authenticateJWT, gameController.startGame);

// ゲーム状態取得エンドポイント
gameRoutes.get('/:gameId/state', authenticateJWT, gameController.getGame);

// ゲームアクション（移動/攻撃）エンドポイント
gameRoutes.post('/:gameId/action', authenticateJWT, gameController.executeAction);

// ゲーム履歴取得エンドポイント
gameRoutes.get('/history', authenticateJWT, gameController.getGameHistory);

// プレイヤーをゲームに追加するエンドポイント
gameRoutes.post('/:gameId/player', authenticateJWT, gameController.addPlayer); 
