"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';

export default function HomePage() {
  const router = useRouter();

  const handleStartNewGame = () => {
    const gameId = uuidv4();
    router.push(`/game/${gameId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold">INVADER Maze AI</h1>
          <p className="mt-2 text-gray-600">
            AIと対戦する迷路ゲーム
          </p>
        </div>
        <div className="space-y-4">
          <Button className="w-full" onClick={handleStartNewGame}>
            新しいゲームを始める
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push('/ai')}>
            AIを開発する
          </Button>
        </div>
      </div>
    </div>
  );
} 
