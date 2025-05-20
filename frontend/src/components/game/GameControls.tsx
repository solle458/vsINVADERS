'use client';

import { useCallback } from 'react';
import { useGameStore, Direction } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap } from 'lucide-react';

export const GameControls: React.FC = () => {
  const { sessions, movePlayer, addEffect } = useGameStore();

  // 現在のゲームセッションを取得（最初のセッションを使用）
  const currentSession = Object.values(sessions)[0];
  if (!currentSession) return null;

  const { state: gameState } = currentSession;
  const gameId = gameState.gameId;

  const handleMove = useCallback((direction: Direction) => {
    if (gameState.gameStatus !== 'playing') return;

    const currentPlayer = gameState.players[gameState.currentTurn || ''];
    if (!currentPlayer || currentPlayer.type !== 'user') return;

    movePlayer(gameId, currentPlayer.id, direction);
  }, [gameState, movePlayer, gameId]);

  const handleAttack = useCallback(() => {
    if (gameState.gameStatus !== 'playing') return;

    const currentPlayer = gameState.players[gameState.currentTurn || ''];
    if (!currentPlayer || currentPlayer.type !== 'user') return;

    addEffect(gameId, {
      type: 'attack',
      position: currentPlayer.position,
      direction: 'north', // デフォルトは北向き
      playerId: currentPlayer.id,
    });
  }, [gameState, addEffect, gameId]);

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
