'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore, Direction, PlayerType } from '@/store/gameStore';

interface GameCanvasProps {
  width?: number;
  height?: number;
  cellSize?: number;
}

interface Position {
  x: number;
  y: number;
}

interface Player {
  id: string;
  type: PlayerType;
  position: Position;
  health: number;
}

interface Effect {
  type: 'attack';
  position: Position;
  direction: Direction;
  playerId: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  width = 800,
  height = 600,
  cellSize = 32,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const { gameState } = useGameStore();

  // Canvasの初期化
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    setCtx(context);
    canvas.width = width;
    canvas.height = height;
  }, [width, height]);

  // ゲーム状態の描画
  useEffect(() => {
    if (!ctx || !gameState) return;

    // キャンバスのクリア
    ctx.clearRect(0, 0, width, height);

    // 迷路の描画
    drawMaze();
    
    // プレイヤーの描画
    drawPlayers();

    // エフェクトの描画
    drawEffects();
  }, [ctx, gameState]);

  // 迷路の描画
  const drawMaze = () => {
    if (!ctx || !gameState?.maze) return;

    const { maze } = gameState;
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 2;

    maze.forEach((row: number[], y: number) => {
      row.forEach((cell: number, x: number) => {
        const posX = x * cellSize;
        const posY = y * cellSize;

        // 壁の描画
        if (cell === 1) {
          ctx.fillStyle = '#1F2937';
          ctx.fillRect(posX, posY, cellSize, cellSize);
        }
      });
    });
  };

  // プレイヤーの描画
  const drawPlayers = () => {
    if (!ctx || !gameState?.players) return;

    const { players } = gameState;

    Object.entries(players).forEach(([playerId, player]: [string, Player]) => {
      const { position, type } = player;
      const posX = position.x * cellSize + cellSize / 2;
      const posY = position.y * cellSize + cellSize / 2;

      // プレイヤーの色を設定
      ctx.fillStyle = type === 'ai' ? '#EF4444' : '#3B82F6';

      // プレイヤーの描画（円形）
      ctx.beginPath();
      ctx.arc(posX, posY, cellSize / 3, 0, Math.PI * 2);
      ctx.fill();

      // プレイヤーIDの表示
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(playerId, posX, posY);
    });
  };

  // エフェクトの描画（攻撃など）
  const drawEffects = () => {
    if (!ctx || !gameState?.effects) return;

    const { effects } = gameState;

    effects.forEach((effect: Effect) => {
      const { type, position, direction } = effect;
      const posX = position.x * cellSize + cellSize / 2;
      const posY = position.y * cellSize + cellSize / 2;

      switch (type) {
        case 'attack':
          // 攻撃エフェクトの描画
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(posX, posY);
          
          // 方向に応じて線を描画
          switch (direction) {
            case 'north':
              ctx.lineTo(posX, posY - cellSize);
              break;
            case 'south':
              ctx.lineTo(posX, posY + cellSize);
              break;
            case 'east':
              ctx.lineTo(posX + cellSize, posY);
              break;
            case 'west':
              ctx.lineTo(posX - cellSize, posY);
              break;
          }
          
          ctx.stroke();
          break;
      }
    });
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="border border-gray-300 rounded-lg bg-gray-100"
        style={{ width, height }}
      />
    </div>
  );
}; 
