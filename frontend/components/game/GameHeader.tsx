'use client';

import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const GameHeader: React.FC = () => {
  const { gameState, resetGame } = useGameStore();
  const router = useRouter();

  if (!gameState) return null;

  const { gameStatus, winner } = gameState;

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h1 className="text-xl font-bold">INVADER Maze AI</h1>
      </div>
      <div className="flex items-center gap-4">
        {gameStatus === 'finished' && (
          <div className="text-lg font-medium">
            {winner ? '🎉 勝利！' : '😢 敗北...'}
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={resetGame}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          リセット
        </Button>
      </div>
    </div>
  );
}; 
