/**
 * 迷路のセルの種類
 */
export enum CellType {
  EMPTY = 0,  // 空のセル（移動可能）
  WALL = 1,   // 壁（移動不可、破壊可能）
  PLAYER = 2, // プレイヤー
}

/**
 * 迷路のサイズ
 */
export interface MazeSize {
  width: number;
  height: number;
}

/**
 * 座標
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 方向
 */
export enum Direction {
  NORTH = 'north',
  SOUTH = 'south',
  EAST = 'east',
  WEST = 'west',
}

/**
 * 迷路クラス
 */
export class Maze {
  private grid: CellType[][]; // 二次元配列で迷路を表現
  private size: MazeSize;
  
  /**
   * コンストラクタ
   * @param size 迷路のサイズ
   */
  constructor(size: MazeSize) {
    this.size = size;
    this.grid = this.initializeGrid();
    this.generateMaze();
  }
  
  /**
   * 迷路の初期化
   * @returns 初期化された迷路の二次元配列
   */
  private initializeGrid(): CellType[][] {
    const grid: CellType[][] = [];
    
    for (let y = 0; y < this.size.height; y++) {
      grid[y] = [];
      for (let x = 0; x < this.size.width; x++) {
        // 外壁は必ず壁に
        if (x === 0 || y === 0 || x === this.size.width - 1 || y === this.size.height - 1) {
          grid[y][x] = CellType.WALL;
        } else {
          grid[y][x] = CellType.EMPTY;
        }
      }
    }
    
    return grid;
  }
  
  /**
   * 迷路の生成（シンプルなアルゴリズム）
   * TODO: より複雑なアルゴリズムに置き換える
   */
  private generateMaze() {
    // 簡単な迷路生成（ランダムに壁を配置）
    for (let y = 1; y < this.size.height - 1; y++) {
      for (let x = 1; x < this.size.width - 1; x++) {
        // 30%の確率で壁を配置
        if (Math.random() < 0.3) {
          this.grid[y][x] = CellType.WALL;
        }
      }
    }
    
    // プレイヤーの初期位置を確保（左上と右下）
    this.grid[1][1] = CellType.EMPTY;
    this.grid[this.size.height - 2][this.size.width - 2] = CellType.EMPTY;
  }
  
  /**
   * 指定された位置のセルの種類を取得
   * @param position 座標
   * @returns セルの種類
   */
  getCell(position: Position): CellType {
    return this.grid[position.y][position.x];
  }
  
  /**
   * 指定された位置のセルを更新
   * @param position 座標
   * @param cellType セルの種類
   */
  setCell(position: Position, cellType: CellType) {
    this.grid[position.y][position.x] = cellType;
  }
  
  /**
   * 指定された位置が迷路内かつ移動可能かチェック
   * @param position 座標
   * @returns 移動可能かどうか
   */
  isValidMove(position: Position): boolean {
    // 迷路内かチェック
    if (
      position.x < 0 ||
      position.y < 0 ||
      position.x >= this.size.width ||
      position.y >= this.size.height
    ) {
      return false;
    }
    
    // 移動可能セルかチェック
    return this.grid[position.y][position.x] === CellType.EMPTY;
  }
  
  /**
   * 指定された方向に移動した場合の新しい位置を計算
   * @param position 現在の座標
   * @param direction 方向
   * @returns 新しい座標
   */
  getNextPosition(position: Position, direction: Direction): Position {
    const newPosition = { ...position };
    
    switch (direction) {
      case Direction.NORTH:
        newPosition.y -= 1;
        break;
      case Direction.SOUTH:
        newPosition.y += 1;
        break;
      case Direction.EAST:
        newPosition.x += 1;
        break;
      case Direction.WEST:
        newPosition.x -= 1;
        break;
    }
    
    return newPosition;
  }
  
  /**
   * 現在の迷路の状態をオブジェクトとして取得
   * @returns 迷路の状態
   */
  getState() {
    return {
      size: this.size,
      grid: this.grid,
    };
  }
} 
