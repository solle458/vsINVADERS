'use client';

import { useCallback } from 'react';
import { useGameStore, Direction } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap } from 'lucide-react';

export const GameControls: React.FC = () => {
  const { gameState, updatePlayerPosition, addEffect } = useGameStore();

  const handleMove = useCallback((direction: Direction) => {
    if (!gameState || gameState.gameStatus !== 'playing') return;

    const currentPlayer = gameState.players[gameState.currentTurn || ''];
    if (!currentPlayer || currentPlayer.type !== 'user') return;

    const { position } = currentPlayer;
    const newPosition = { ...position };

    switch (direction) {
      case 'north':
        newPosition.y = Math.max(0, position.y - 1);
        break;
      case 'south':
        newPosition.y = Math.min(gameState.maze.length - 1, position.y + 1);
        break;
      case 'east':
        newPosition.x = Math.min(gameState.maze[0].length - 1, position.x + 1);
        break;
      case 'west':
        newPosition.x = Math.max(0, position.x - 1);
        break;
    }

    // 壁との衝突チェック
    if (gameState.maze[newPosition.y][newPosition.x] === 1) return;

    updatePlayerPosition(currentPlayer.id, newPosition);
  }, [gameState, updatePlayerPosition]);

  const handleAttack = useCallback(() => {
    if (!gameState || gameState.gameStatus !== 'playing') return;

    const currentPlayer = gameState.players[gameState.currentTurn || ''];
    if (!currentPlayer || currentPlayer.type !== 'user') return;

    addEffect({
      type: 'attack',
      position: currentPlayer.position,
      direction: 'north', // デフォルトは北向き
      playerId: currentPlayer.id,
    });
  }, [gameState, addEffect]);

  if (!gameState) return null;

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-lg">
      <div className="grid grid-cols-3 gap-2">
        <div />
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleMove('north')}
          disabled={gameState.gameStatus !== 'playing'}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <div />
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleMove('west')}
          disabled={gameState.gameStatus !== 'playing'}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleAttack}
          disabled={gameState.gameStatus !== 'playing'}
        >
          <Zap className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleMove('east')}
          disabled={gameState.gameStatus !== 'playing'}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <div />
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleMove('south')}
          disabled={gameState.gameStatus !== 'playing'}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <div />
      </div>
      <div className="text-sm text-gray-500">
        {gameState.gameStatus === 'waiting' && 'ゲーム開始を待っています...'}
        {gameState.gameStatus === 'playing' && 'あなたのターンです'}
        {gameState.gameStatus === 'finished' && `ゲーム終了: ${gameState.winner ? '勝利！' : '敗北...'}`}
      </div>
    </div>
  );
}; 
