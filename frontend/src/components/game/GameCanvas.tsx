'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore, Direction, Player, Effect, Position } from '@/store/gameStore';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { sessions } = useGameStore();

  const currentSession = Object.values(sessions)[0];
  if (!currentSession) return null;
  const { state: gameState } = currentSession;

  // 画面サイズに合わせてcanvasサイズとcellSizeを計算
  const [dimensions, setDimensions] = useState({ width: 600, height: 600, cellSize: 60 });

  useEffect(() => {
    function updateSize() {
      const maze = gameState.maze;
      const rows = maze.length;
      const cols = maze[0].length;
      // 画面の80%を使う
      const maxWidth = window.innerWidth * 0.8;
      const maxHeight = window.innerHeight * 0.8;
      // セルサイズを計算
      const cellSize = Math.floor(Math.min(maxWidth / cols, maxHeight / rows));
      setDimensions({
        width: cellSize * cols,
        height: cellSize * rows,
        cellSize,
      });
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [gameState.maze]);

  // Canvasの初期化
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
  }, [dimensions]);

  // ゲーム状態の描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // キャンバスのクリア
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    // 迷路の描画
    drawMaze(ctx);
    // プレイヤーの描画
    drawPlayers(ctx);
    // エフェクトの描画
    drawEffects(ctx);
  }, [gameState, dimensions]);

  // 迷路の描画
  const drawMaze = (ctx: CanvasRenderingContext2D) => {
    if (!gameState?.maze) return;
    const { maze } = gameState;
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 2;
    maze.forEach((row: number[], y: number) => {
      row.forEach((cell: number, x: number) => {
        const posX = x * dimensions.cellSize;
        const posY = y * dimensions.cellSize;
        // 壁の描画
        if (cell === 1) {
          ctx.fillStyle = '#1F2937';
          ctx.fillRect(posX, posY, dimensions.cellSize, dimensions.cellSize);
        }
      });
    });
  };

  // プレイヤーの描画
  const drawPlayers = (ctx: CanvasRenderingContext2D) => {
    if (!gameState?.players) return;
    const { players } = gameState;
    Object.entries(players).forEach(([playerId, player]: [string, Player]) => {
      const { position, type } = player;
      const posX = position.x * dimensions.cellSize + dimensions.cellSize / 2;
      const posY = position.y * dimensions.cellSize + dimensions.cellSize / 2;
      // プレイヤーの色を設定
      ctx.fillStyle = type === 'ai' ? '#EF4444' : '#3B82F6';
      // プレイヤーの描画（円形）
      ctx.beginPath();
      ctx.arc(posX, posY, dimensions.cellSize / 3, 0, Math.PI * 2);
      ctx.fill();
      // プレイヤーIDの表示
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `${Math.floor(dimensions.cellSize / 3)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(playerId, posX, posY);
    });
  };

  // エフェクトの描画（攻撃など）
  const drawEffects = (ctx: CanvasRenderingContext2D) => {
    if (!gameState?.effects) return;
    const { effects } = gameState;
    effects.forEach((effect: Effect) => {
      const { type, position, direction } = effect;
      const posX = position.x * dimensions.cellSize + dimensions.cellSize / 2;
      const posY = position.y * dimensions.cellSize + dimensions.cellSize / 2;
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
              ctx.lineTo(posX, posY - dimensions.cellSize);
              break;
            case 'south':
              ctx.lineTo(posX, posY + dimensions.cellSize);
              break;
            case 'east':
              ctx.lineTo(posX + dimensions.cellSize, posY);
              break;
            case 'west':
              ctx.lineTo(posX - dimensions.cellSize, posY);
              break;
          }
          ctx.stroke();
          break;
      }
    });
  };

  return (
    <div className="flex justify-center items-center w-full h-full">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="border border-gray-300 rounded-lg bg-gray-100"
        style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block' }}
      />
    </div>
  );
}; 
