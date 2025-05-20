import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Game, GameMode, GameSettings, GameStatus } from '../models/game';
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
      const { gameMode, mazeSize } = req.body;
      
      // モードのバリデーション
      if (!Object.values(GameMode).includes(gameMode)) {
        throw Errors.game.invalidGameMode();
      }
      
      // 迷路サイズのバリデーション
      if (!mazeSize || !mazeSize.width || !mazeSize.height) {
        throw Errors.badRequest('Invalid maze size');
      }
      
      // ゲーム設定
      const settings: GameSettings = {
        mode: gameMode,
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
      
      // API仕様に合わせたレスポンス形式
      res.status(200).json({
        gameId: game.id,
        state: {
          gameId: game.id,
          maze: game.maze.getState().grid,
          players: {
            player1: {
              id: player1.id,
              type: player1.type,
              position: player1.position
            }
          },
          effects: [],
          currentTurn: "player1",
          gameStatus: game.status,
          winner: null
        },
        lastUpdated: new Date().getTime()
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
      
      // API仕様に合わせたレスポンス形式
      const gameState = game.getState();
      const players: Record<string, any> = {};
      
      gameState.players.forEach((player, index) => {
        const playerKey = `player${index + 1}`;
        players[playerKey] = {
          id: player.id,
          type: player.type,
          position: player.position
        };
      });
      
      // 現在のターンのプレイヤー番号を取得
      const currentPlayerIndex = (game.currentTurn - 1) % 2;
      const currentPlayerKey = `player${currentPlayerIndex + 1}`;
      
      // 勝者が存在する場合、そのプレイヤー番号を取得
      let winnerKey = null;
      if (game.winnerIndex !== null) {
        winnerKey = `player${game.winnerIndex + 1}`;
      }
      
      res.status(200).json({
        gameId,
        state: {
          gameId: gameId,
          maze: gameState.maze.grid,
          players: players,
          effects: [],
          currentTurn: currentPlayerKey,
          gameStatus: gameState.status,
          winner: winnerKey
        },
        lastUpdated: new Date().getTime()
      });
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
      
      // API仕様に合わせたレスポンス形式
      const gameState = game.getState();
      const players: Record<string, any> = {};
      
      gameState.players.forEach((player, index) => {
        const playerKey = `player${index + 1}`;
        players[playerKey] = {
          id: player.id,
          type: player.type,
          position: player.position
        };
      });
      
      // 現在のターンのプレイヤー番号を取得
      const currentPlayerIndex = (game.currentTurn - 1) % 2;
      const currentPlayerKey = `player${currentPlayerIndex + 1}`;
      
      // 勝者が存在する場合、そのプレイヤー番号を取得
      let winnerKey = null;
      if (game.winnerIndex !== null) {
        winnerKey = `player${game.winnerIndex + 1}`;
      }
      
      res.status(200).json({
        gameId,
        state: {
          gameId: gameId,
          maze: gameState.maze.grid,
          players: players,
          effects: [],
          currentTurn: currentPlayerKey,
          gameStatus: gameState.status,
          winner: winnerKey
        },
        lastUpdated: new Date().getTime()
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
      const games = Array.from(activeGames.values()).map(game => {
        const playerTypes: Record<string, { type: string }> = {};
        
        game.players.forEach((player, index) => {
          playerTypes[`player${index + 1}`] = {
            type: player.type
          };
        });

        let winner = null;
        if (game.winnerIndex !== null) {
          winner = `player${game.winnerIndex + 1}`;
        }
        
        return {
          gameId: game.id,
          startedAt: game.createdAt.toISOString(),
          finishedAt: game.status === GameStatus.FINISHED ? game.lastUpdatedAt.toISOString() : null,
          winner: winner,
          players: playerTypes,
          totalTurns: game.currentTurn
        };
      });
      
      res.status(200).json({
        games,
        total: games.length,
        hasMore: false
      });
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
      
      // API仕様に合わせたレスポンス形式
      res.status(200).json({
        success: true,
        gameId: game.id,
        playerId: player.id,
        status: game.status
      });
    } catch (error) {
      next(error);
    }
  },
}; 
