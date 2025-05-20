import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Game, GameMode, GameSettings } from '../models/game';
import { Player, PlayerType, ActionType, ActionResult } from '../models/player';
import { Direction } from '../models/maze';
import { Errors } from '../utils/errors';

// インメモリゲーム管理（将来的にはDBに置き換える）
const activeGames = new Map<string, Game>();

/**
 * ゲームコントローラ
 */
export const gameController = {
  /**
   * 新しいゲームを開始
   */
  startGame: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { mode, mazeSize } = req.body;
      
      // モードのバリデーション
      if (!Object.values(GameMode).includes(mode)) {
        throw Errors.game.invalidGameMode();
      }
      
      // 迷路サイズのバリデーション
      if (!mazeSize || !mazeSize.width || !mazeSize.height) {
        throw Errors.badRequest('Invalid maze size');
      }
      
      // ゲーム設定
      const settings: GameSettings = {
        mode,
        mazeSize: {
          width: Math.min(Math.max(mazeSize.width, 5), 30),
          height: Math.min(Math.max(mazeSize.height, 5), 30),
        },
      };
      
      // 新しいゲームを作成
      const game = new Game(settings);
      
      // テスト用のプレイヤーを追加
      const player1 = new Player({
        id: uuidv4(),
        name: 'Player 1',
        type: PlayerType.USER,
        position: { x: 1, y: 1 },
      });
      
      game.addPlayer(player1);
      
      // アクティブゲームに追加
      activeGames.set(game.id, game);
      
      res.status(200).json({
        gameId: game.id,
        status: game.status,
        maze: game.maze.getState(),
        players: game.players.map(p => p.getState()),
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * ゲーム状態を取得
   */
  getGame: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      
      // ゲームを取得
      const game = activeGames.get(gameId);
      if (!game) {
        throw Errors.notFound('Game not found');
      }
      
      res.status(200).json(game.getState());
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * ゲームアクションを実行
   */
  executeAction: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      const { playerId, action, direction } = req.body;
      
      // バリデーション
      if (!playerId || !action || !direction) {
        throw Errors.badRequest('Missing required fields');
      }
      
      // アクションタイプのバリデーション
      if (!Object.values(ActionType).includes(action)) {
        throw Errors.game.invalidAction();
      }
      
      // 方向のバリデーション
      if (!Object.values(Direction).includes(direction)) {
        throw Errors.badRequest('Invalid direction');
      }
      
      // ゲームを取得
      const game = activeGames.get(gameId);
      if (!game) {
        throw Errors.notFound('Game not found');
      }
      
      // アクションを実行
      let result: ActionResult;
      try {
        result = game.processAction(playerId, action, direction);
      } catch (error: any) {
        if (error.message === 'Not your turn') {
          throw Errors.game.notYourTurn();
        } else if (error.message === 'Game is not in playing state') {
          throw Errors.game.gameAlreadyFinished();
        } else {
          throw error;
        }
      }
      
      // 結果を返す
      res.status(200).json({
        gameId,
        result,
        newState: game.getState(),
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * ゲーム履歴を取得
   */
  getGameHistory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 実際の実装ではDBから履歴を取得
      // 現在はアクティブなゲームのリストを返す
      const games = Array.from(activeGames.values()).map(game => ({
        id: game.id,
        mode: game.mode,
        status: game.status,
        createdAt: game.createdAt,
        lastUpdatedAt: game.lastUpdatedAt,
        players: game.players.map(p => p.getState()),
      }));
      
      res.status(200).json({ games });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * プレイヤーをゲームに追加
   */
  addPlayer: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId } = req.params;
      const { name, type } = req.body;
      
      // バリデーション
      if (!name || !type) {
        throw Errors.badRequest('Missing required fields');
      }
      
      // プレイヤータイプのバリデーション
      if (!Object.values(PlayerType).includes(type)) {
        throw Errors.badRequest('Invalid player type');
      }
      
      // ゲームを取得
      const game = activeGames.get(gameId);
      if (!game) {
        throw Errors.notFound('Game not found');
      }
      
      // プレイヤーを追加
      if (game.players.length >= 2) {
        throw Errors.conflict('Game already has maximum number of players');
      }
      
      const player = new Player({
        id: uuidv4(),
        name,
        type,
        position: { x: game.maze.getState().size.width - 2, y: game.maze.getState().size.height - 2 },
      });
      
      game.addPlayer(player);
      
      res.status(200).json({
        gameId: game.id,
        playerId: player.id,
        status: game.status,
      });
    } catch (error) {
      next(error);
    }
  },
}; 
