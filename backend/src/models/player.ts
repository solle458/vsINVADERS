import { Position, Direction } from './maze';

/**
 * プレイヤータイプ
 */
export enum PlayerType {
  AI = 'ai',
  USER = 'user',
}

/**
 * アクションタイプ
 */
export enum ActionType {
  MOVE = 'move',
  ATTACK = 'attack',
}

/**
 * アクション結果
 */
export enum ActionResult {
  SUCCESS = 'success',  // 成功
  BLOCKED = 'blocked',  // 壁などで阻止された
  HIT = 'hit',         // 攻撃が命中
  MISS = 'miss',       // 攻撃が失敗
}

/**
 * プレイヤーインターフェース
 */
export interface PlayerData {
  id: string;
  name: string;
  type: PlayerType;
  position: Position;
}

/**
 * プレイヤークラス
 */
export class Player {
  id: string;
  name: string;
  type: PlayerType;
  position: Position;
  
  /**
   * コンストラクタ
   * @param data プレイヤーデータ
   */
  constructor(data: PlayerData) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.position = data.position;
  }
  
  /**
   * プレイヤーの位置を更新
   * @param position 新しい位置
   */
  updatePosition(position: Position) {
    this.position = position;
  }
  
  /**
   * プレイヤーの状態をオブジェクトとして取得
   * @returns プレイヤーの状態
   */
  getState() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      position: this.position,
    };
  }
}

/**
 * AIプレイヤークラス
 */
export class AIPlayer extends Player {
  aiScriptId: string;
  containerId: string | null;
  
  /**
   * コンストラクタ
   * @param data プレイヤーデータ
   * @param aiScriptId AIスクリプトID
   */
  constructor(data: PlayerData, aiScriptId: string) {
    super(data);
    this.type = PlayerType.AI;
    this.aiScriptId = aiScriptId;
    this.containerId = null;
  }
  
  /**
   * AIコンテナIDを設定
   * @param containerId コンテナID
   */
  setContainerId(containerId: string) {
    this.containerId = containerId;
  }
  
  /**
   * AIプレイヤーの状態をオブジェクトとして取得
   * @returns AIプレイヤーの状態
   */
  getState() {
    return {
      ...super.getState(),
      aiScriptId: this.aiScriptId,
      containerId: this.containerId,
    };
  }
}

/**
 * ユーザープレイヤークラス
 */
export class UserPlayer extends Player {
  userId: string;
  
  /**
   * コンストラクタ
   * @param data プレイヤーデータ
   * @param userId ユーザーID
   */
  constructor(data: PlayerData, userId: string) {
    super(data);
    this.type = PlayerType.USER;
    this.userId = userId;
  }
  
  /**
   * ユーザープレイヤーの状態をオブジェクトとして取得
   * @returns ユーザープレイヤーの状態
   */
  getState() {
    return {
      ...super.getState(),
      userId: this.userId,
    };
  }
} 
