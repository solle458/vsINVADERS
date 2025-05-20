'use client';

import { useGameStore, Player } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const GameStatus: React.FC = () => {
  const { sessions } = useGameStore();

  // 現在のゲームセッションを取得（最初のセッションを使用）
  const currentSession = Object.values(sessions)[0];
  if (!currentSession) return null;

  const { state: gameState } = currentSession;
  const { players, currentTurn, gameStatus } = gameState;

  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(players).map(([playerId, player]: [string, Player]) => (
        <Card key={playerId} className={currentTurn === playerId ? 'ring-2 ring-primary' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${player.type === 'ai' ? 'bg-red-500' : 'bg-blue-500'}`} />
              {player.type === 'ai' ? 'AI' : 'プレイヤー'} {playerId}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-gray-500">
                位置: ({player.position.x}, {player.position.y})
              </div>
              {currentTurn === playerId && gameStatus === 'playing' && (
                <div className="text-sm text-primary font-medium">
                  アクション中...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}; 
