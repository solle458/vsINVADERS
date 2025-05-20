/**
 * APIエラークラス
 */
export class APIError extends Error {
  statusCode: number;
  errorCode: string;
  details?: object;

  /**
   * コンストラクタ
   * @param message エラーメッセージ
   * @param statusCode HTTPステータスコード
   * @param errorCode エラーコード
   * @param details 詳細情報
   */
  constructor(
    message: string, 
    statusCode: number = 500, 
    errorCode: string = 'INTERNAL_ERROR',
    details?: object
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

/**
 * 標準的なAPIエラーの作成関数
 */
export const Errors = {
  /**
   * 不正なリクエスト
   * @param message エラーメッセージ
   * @param details 詳細情報
   * @returns APIエラー
   */
  badRequest: (message: string = 'Invalid request', details?: object) => {
    return new APIError(message, 400, 'INVALID_REQUEST', details);
  },

  /**
   * 認証エラー
   * @param message エラーメッセージ
   * @param details 詳細情報
   * @returns APIエラー
   */
  unauthorized: (message: string = 'Authentication required', details?: object) => {
    return new APIError(message, 401, 'UNAUTHORIZED', details);
  },

  /**
   * 権限不足
   * @param message エラーメッセージ
   * @param details 詳細情報
   * @returns APIエラー
   */
  forbidden: (message: string = 'Insufficient permissions', details?: object) => {
    return new APIError(message, 403, 'FORBIDDEN', details);
  },

  /**
   * リソースが見つからない
   * @param message エラーメッセージ
   * @param details 詳細情報
   * @returns APIエラー
   */
  notFound: (message: string = 'Resource not found', details?: object) => {
    return new APIError(message, 404, 'NOT_FOUND', details);
  },

  /**
   * リソースの競合
   * @param message エラーメッセージ
   * @param details 詳細情報
   * @returns APIエラー
   */
  conflict: (message: string = 'Resource conflict', details?: object) => {
    return new APIError(message, 409, 'CONFLICT', details);
  },

  /**
   * レート制限超過
   * @param message エラーメッセージ
   * @param details 詳細情報
   * @returns APIエラー
   */
  rateLimited: (message: string = 'Rate limit exceeded', details?: object) => {
    return new APIError(message, 429, 'RATE_LIMITED', details);
  },

  /**
   * サーバー内部エラー
   * @param message エラーメッセージ
   * @param details 詳細情報
   * @returns APIエラー
   */
  internal: (message: string = 'Internal server error', details?: object) => {
    return new APIError(message, 500, 'INTERNAL_ERROR', details);
  },

  /**
   * ゲーム固有のエラー
   */
  game: {
    /**
     * 不正なゲームモード
     * @param message エラーメッセージ
     * @param details 詳細情報
     * @returns APIエラー
     */
    invalidGameMode: (message: string = 'Invalid game mode', details?: object) => {
      return new APIError(message, 400, 'INVALID_GAME_MODE', details);
    },

    /**
     * 不正なアクション
     * @param message エラーメッセージ
     * @param details 詳細情報
     * @returns APIエラー
     */
    invalidAction: (message: string = 'Invalid action', details?: object) => {
      return new APIError(message, 400, 'INVALID_ACTION', details);
    },

    /**
     * 自分のターンではない
     * @param message エラーメッセージ
     * @param details 詳細情報
     * @returns APIエラー
     */
    notYourTurn: (message: string = 'Not your turn', details?: object) => {
      return new APIError(message, 400, 'NOT_YOUR_TURN', details);
    },

    /**
     * ゲームは既に終了している
     * @param message エラーメッセージ
     * @param details 詳細情報
     * @returns APIエラー
     */
    gameAlreadyFinished: (message: string = 'Game is already finished', details?: object) => {
      return new APIError(message, 400, 'GAME_ALREADY_FINISHED', details);
    },

    /**
     * AI実行エラー
     * @param message エラーメッセージ
     * @param details 詳細情報
     * @returns APIエラー
     */
    aiExecutionError: (message: string = 'AI execution error', details?: object) => {
      return new APIError(message, 500, 'AI_EXECUTION_ERROR', details);
    }
  }
}; 
