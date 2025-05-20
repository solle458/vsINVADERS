'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { GameHeader } from '@/components/game/GameHeader';
import { GameCanvas } from '@/components/game/GameCanvas';
import { GameControls } from '@/components/game/GameControls';
import { GameStatus } from '@/components/game/GameStatus';
import { useGameStore } from '@/store/gameStore';
import { GameProvider } from '@/components/game/GameProvider';

interface GamePageProps {
  params: {
    gameId: string;
  };
}

export default function GamePage({ params }: GamePageProps) {
  const { gameId } = params;
  const router = useRouter();
  const { createGame, getGame } = useGameStore();

  useEffect(() => {
    // ゲームが存在しない場合は新規作成
    if (!getGame(gameId)) {
      createGame(gameId);
    }
  }, [gameId, createGame, getGame]);

  return (
    <GameProvider gameId={gameId}>
      <GameContent gameId={gameId} />
    </GameProvider>
  );
}

interface GameContentProps {
  gameId: string;
}

function GameContent({ gameId }: GameContentProps) {
  const { getGame } = useGameStore();
  const gameSession = getGame(gameId);

  if (!gameSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">ゲームを読み込み中...</div>
      </div>
    );
  }

  const { state: gameState } = gameSession;

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <GameHeader />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <GameCanvas />
            <GameControls />
          </div>
          <div>
            <GameStatus />
          </div>
        </div>
      </div>
    </div>
  );
} 
