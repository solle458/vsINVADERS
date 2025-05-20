import { v4 as uuidv4 } from 'uuid';
import { Maze, Position, Direction, CellType } from './maze';
import { Player, PlayerType, ActionType, ActionResult } from './player';

/**
 * ゲームモード
 */
export enum GameMode {
  AI_VS_USER = 'ai_vs_user',
  AI_VS_AI = 'ai_vs_ai',
}

/**
 * ゲームの状態
 */
export enum GameStatus {
  WAITING = 'waiting',   // プレイヤー接続待ち
  PLAYING = 'playing',   // プレイ中
  FINISHED = 'finished', // 終了
  ERROR = 'error',       // エラー
}

/**
 * ゲームの設定
 */
export interface GameSettings {
  mode: GameMode;
  mazeSize: { width: number; height: number };
}

/**
 * ゲームのターン情報
 */
export interface GameTurn {
  turnNumber: number;
  gameId: string;
  state: any; // 迷路とプレイヤーの状態
  timestamp: Date;
}

/**
 * コマンド情報
 */
export interface GameCommand {
  id: string;
  gameId: string;
  turnNumber: number;
  playerId: string;
  playerType: PlayerType;
  action: ActionType;
  direction: Direction;
  result: ActionResult;
  timestamp: Date;
}

/**
 * ゲームクラス
 */
export class Game {
  id: string;
  mode: GameMode;
  maze: Maze;
  players: Player[];
  currentTurn: number;
  status: GameStatus;
  createdAt: Date;
  lastUpdatedAt: Date;
  winnerIndex: number | null;
  
  /**
   * コンストラクタ
   * @param settings ゲーム設定
   */
  constructor(settings: GameSettings) {
    this.id = uuidv4();
    this.mode = settings.mode;
    this.maze = new Maze(settings.mazeSize);
    this.players = [];
    this.currentTurn = 0;
    this.status = GameStatus.WAITING;
    this.createdAt = new Date();
    this.lastUpdatedAt = new Date();
    this.winnerIndex = null;
  }
  
  /**
   * プレイヤーの追加
   * @param player プレイヤー
   */
  addPlayer(player: Player) {
    if (this.players.length >= 2) {
      throw new Error('Game already has maximum number of players');
    }
    
    this.players.push(player);
    
    // プレイヤーが2人揃ったらゲーム開始
    if (this.players.length === 2) {
      this.status = GameStatus.PLAYING;
      this.currentTurn = 1;
    }
    
    this.lastUpdatedAt = new Date();
  }
  
  /**
   * 指定されたターンのプレイヤーIDを取得
   * @returns 現在のターンのプレイヤーID
   */
  getCurrentPlayerId(): string {
    const playerIndex = (this.currentTurn - 1) % 2;
    return this.players[playerIndex].id;
  }
  
  /**
   * プレイヤーの行動を処理
   * @param playerId プレイヤーID
   * @param action アクションタイプ
   * @param direction 方向
   * @returns アクション結果
   */
  processAction(playerId: string, action: ActionType, direction: Direction): ActionResult {
    // ゲームが終了している場合はエラー
    if (this.status !== GameStatus.PLAYING) {
      throw new Error('Game is not in playing state');
    }
    
    // プレイヤーのターンではない場合はエラー
    if (playerId !== this.getCurrentPlayerId()) {
      throw new Error('Not your turn');
    }
    
    // プレイヤーを特定
    const playerIndex = this.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      throw new Error('Player not found');
    }
    
    const player = this.players[playerIndex];
    const result = this.executeAction(player, action, direction);
    
    // 次のターンへ
    if (result !== ActionResult.BLOCKED) {
      this.currentTurn++;
    }
    
    this.lastUpdatedAt = new Date();
    
    return result;
  }
  
  /**
   * アクションを実行
   * @param player プレイヤー
   * @param action アクション
   * @param direction 方向
   * @returns アクション結果
   */
  private executeAction(player: Player, action: ActionType, direction: Direction): ActionResult {
    switch (action) {
      case ActionType.MOVE:
        return this.executeMove(player, direction);
      case ActionType.ATTACK:
        return this.executeAttack(player, direction);
      default:
        throw new Error('Invalid action type');
    }
  }
  
  /**
   * 移動を実行
   * @param player プレイヤー
   * @param direction 方向
   * @returns アクション結果
   */
  private executeMove(player: Player, direction: Direction): ActionResult {
    const newPosition = this.maze.getNextPosition(player.position, direction);
    
    // 移動先が有効か確認
    if (!this.maze.isValidMove(newPosition)) {
      return ActionResult.BLOCKED;
    }
    
    // 移動前のセルを空にする
    this.maze.setCell(player.position, CellType.EMPTY);
    
    // プレイヤーの位置を更新
    player.updatePosition(newPosition);
    
    // 移動先のセルにプレイヤーを設定
    this.maze.setCell(newPosition, CellType.PLAYER);
    
    return ActionResult.SUCCESS;
  }
  
  /**
   * 攻撃を実行
   * @param player プレイヤー
   * @param direction 方向
   * @returns アクション結果
   */
  private executeAttack(player: Player, direction: Direction): ActionResult {
    // 攻撃方向の位置を計算
    const targetPosition = this.maze.getNextPosition(player.position, direction);
    
    // 対象のセルを取得
    const targetCell = this.maze.getCell(targetPosition);
    
    if (targetCell === CellType.WALL) {
      // 壁を破壊
      this.maze.setCell(targetPosition, CellType.EMPTY);
      return ActionResult.SUCCESS;
    } else if (targetCell === CellType.PLAYER) {
      // プレイヤーに攻撃が命中した場合
      const targetPlayerIndex = this.players.findIndex(
        p => p.position.x === targetPosition.x && p.position.y === targetPosition.y
      );
      
      if (targetPlayerIndex !== -1) {
        // ゲーム終了
        this.status = GameStatus.FINISHED;
        this.winnerIndex = this.players.findIndex(p => p.id === player.id);
        return ActionResult.HIT;
      }
    }
    
    return ActionResult.MISS;
  }
  
  /**
   * ゲームの状態を取得
   * @returns ゲームの状態
   */
  getState() {
    return {
      id: this.id,
      mode: this.mode,
      status: this.status,
      currentTurn: this.currentTurn,
      maze: this.maze.getState(),
      players: this.players.map(p => p.getState()),
      createdAt: this.createdAt,
      lastUpdatedAt: this.lastUpdatedAt,
      winner: this.winnerIndex !== null ? this.players[this.winnerIndex].getState() : null,
    };
  }
  
  /**
   * ターン情報を生成
   * @returns ターン情報
   */
  generateTurnData(): GameTurn {
    return {
      turnNumber: this.currentTurn,
      gameId: this.id,
      state: {
        maze: this.maze.getState(),
        players: this.players.map(p => p.getState()),
      },
      timestamp: new Date(),
    };
  }
} 
