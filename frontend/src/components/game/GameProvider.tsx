'use client';

import { ReactNode, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

interface GameProviderProps {
  children: ReactNode;
  gameId: string;
}

export function GameProvider({ children, gameId }: GameProviderProps) {
  // クライアントサイドでのみ実行されるように'use client'ディレクティブを使用
  const { createGame, getGame } = useGameStore();

  useEffect(() => {
    // ゲームが存在しない場合は新規作成
    if (!getGame(gameId)) {
      createGame(gameId);
    }
  }, [gameId, createGame, getGame]);

  return <>{children}</>;
} 
