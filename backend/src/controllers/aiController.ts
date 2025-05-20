import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Errors } from '../utils/errors';

// 仮のAIコンテナ情報（実際のプロジェクトではDBに保存）
const aiContainers = new Map<string, {
  id: string;
  aiScriptId: string;
  gameId: string;
  playerId: string;
  status: 'running' | 'stopped' | 'error';
  startedAt: Date;
  stoppedAt: Date | null;
  lastHeartbeat: Date;
  error: string | null;
}>();

// 仮のAIスクリプト情報（実際のプロジェクトではDBに保存）
const aiScripts = new Map<string, {
  id: string;
  name: string;
  ownerId: string;
  filename: string;
  uploadedAt: Date;
  status: 'active' | 'inactive' | 'error';
  lastRunAt: Date | null;
}>();

/**
 * AIコントローラ
 */
export const aiController = {
  /**
   * AIコンテナを起動
   */
  startContainer: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { aiId, gameId, playerId } = req.body;
      
      // バリデーション
      if (!aiId || !gameId || !playerId) {
        throw Errors.badRequest('Missing required fields');
      }
      
      // AIスクリプトの存在確認（実際の実装ではDBから検索）
      const aiScript = aiScripts.get(aiId);
      if (!aiScript) {
        throw Errors.notFound('AI script not found');
      }
      
      // 新しいコンテナIDを生成
      const containerId = uuidv4();
      
      // コンテナ情報を作成
      const containerInfo = {
        id: containerId,
        aiScriptId: aiId,
        gameId,
        playerId,
        status: 'running' as const,
        startedAt: new Date(),
        stoppedAt: null,
        lastHeartbeat: new Date(),
        error: null,
      };
      
      // コンテナを保存
      aiContainers.set(containerId, containerInfo);
      
      // AIスクリプトの最終実行日時を更新
      aiScript.lastRunAt = new Date();
      
      // TODO: 実際のDockerコンテナ起動処理を実装
      
      res.status(200).json({
        containerId,
        status: containerInfo.status,
        startedAt: containerInfo.startedAt,
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * AIコンテナの状態を取得
   */
  getContainerStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { containerId } = req.params;
      
      // コンテナ情報を取得
      const containerInfo = aiContainers.get(containerId);
      if (!containerInfo) {
        throw Errors.notFound('Container not found');
      }
      
      res.status(200).json({
        containerId: containerInfo.id,
        status: containerInfo.status,
        startedAt: containerInfo.startedAt,
        lastHeartbeat: containerInfo.lastHeartbeat,
        error: containerInfo.error ? { message: containerInfo.error } : null,
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * AIコンテナを停止
   */
  stopContainer: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { containerId } = req.params;
      
      // コンテナ情報を取得
      const containerInfo = aiContainers.get(containerId);
      if (!containerInfo) {
        throw Errors.notFound('Container not found');
      }
      
      // すでに停止している場合
      if (containerInfo.status === 'stopped') {
        return res.status(200).json({
          success: true,
          stoppedAt: containerInfo.stoppedAt,
        });
      }
      
      // コンテナを停止
      containerInfo.status = 'stopped';
      containerInfo.stoppedAt = new Date();
      
      // TODO: 実際のDockerコンテナ停止処理を実装
      
      res.status(200).json({
        success: true,
        stoppedAt: containerInfo.stoppedAt,
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * AIスクリプトをアップロード
   */
  uploadScript: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        throw Errors.unauthorized();
      }
      
      if (!name) {
        throw Errors.badRequest('Script name is required');
      }
      
      // TODO: 実際のファイルアップロード処理を実装
      
      // 新しいAIスクリプトID
      const aiId = uuidv4();
      
      // スクリプト情報を作成
      const scriptInfo = {
        id: aiId,
        name,
        ownerId: userId,
        filename: `ai_${aiId}.py`,
        uploadedAt: new Date(),
        status: 'active' as const,
        lastRunAt: null,
      };
      
      // スクリプトを保存
      aiScripts.set(aiId, scriptInfo);
      
      res.status(200).json({
        aiId: scriptInfo.id,
        name: scriptInfo.name,
        status: scriptInfo.status,
        uploadedAt: scriptInfo.uploadedAt,
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * AIスクリプト一覧を取得
   */
  getScripts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw Errors.unauthorized();
      }
      
      // ユーザーのAIスクリプトを取得
      const userScripts = Array.from(aiScripts.values())
        .filter(script => script.ownerId === userId)
        .map(script => ({
          id: script.id,
          name: script.name,
          uploadedAt: script.uploadedAt,
          status: script.status,
          lastRunAt: script.lastRunAt,
        }));
      
      res.status(200).json({ scripts: userScripts });
    } catch (error) {
      next(error);
    }
  },
}; 
