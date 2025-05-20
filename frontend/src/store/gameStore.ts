import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 型定義
export type Direction = 'north' | 'south' | 'east' | 'west';
export type GameStatus = 'waiting' | 'playing' | 'finished';
export type PlayerType = 'user' | 'ai';

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  type: PlayerType;
  position: Position;
  health: number;
}

export interface Effect {
  type: 'attack';
  position: Position;
  direction: Direction;
  playerId: string;
}

export interface GameState {
  gameId: string;
  maze: number[][];
  players: Record<string, Player>;
  effects: Effect[];
  currentTurn: string | null;
  gameStatus: GameStatus;
  winner: string | null;
}

export interface GameSession {
  state: GameState;
  lastUpdated: number;
}

interface GameStore {
  // ゲームセッションの管理
  sessions: Record<string, GameSession>;
  
  // アクション
  createGame: (gameId: string, initialState?: Partial<GameState>) => void;
  getGame: (gameId: string) => GameSession | null;
  updateGame: (gameId: string, state: Partial<GameState>) => void;
  deleteGame: (gameId: string) => void;
  
  // ゲーム操作
  movePlayer: (gameId: string, playerId: string, direction: Direction) => void;
  addEffect: (gameId: string, effect: Effect) => void;
  resetGame: (gameId: string) => void;
}

const createInitialGameState = (gameId: string): GameState => ({
  gameId,
  maze: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  players: {
    player1: {
      id: 'player1',
      type: 'user',
      position: { x: 1, y: 1 },
      health: 100,
    },
    player2: {
      id: 'player2',
      type: 'ai',
      position: { x: 3, y: 3 },
      health: 100,
    },
  },
  effects: [],
  currentTurn: 'player1',
  gameStatus: 'playing',
  winner: null,
});

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      sessions: {},

      createGame: (gameId, initialState) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [gameId]: {
              state: {
                ...createInitialGameState(gameId),
                ...initialState,
              },
              lastUpdated: Date.now(),
            },
          },
        }));
      },

      getGame: (gameId) => {
        return get().sessions[gameId] || null;
      },

      updateGame: (gameId, newState) => {
        set((state) => {
          const session = state.sessions[gameId];
          if (!session) return state;

          return {
            sessions: {
              ...state.sessions,
              [gameId]: {
                state: {
                  ...session.state,
                  ...newState,
                },
                lastUpdated: Date.now(),
              },
            },
          };
        });
      },

      deleteGame: (gameId) => {
        set((state) => {
          const { [gameId]: _, ...remainingSessions } = state.sessions;
          return { sessions: remainingSessions };
        });
      },

      movePlayer: (gameId, playerId, direction) => {
        set((state) => {
          const session = state.sessions[gameId];
          if (!session) return state;

          const { state: gameState } = session;
          const player = gameState.players[playerId];
          if (!player) return state;

          const newPosition = { ...player.position };

          switch (direction) {
            case 'north':
              newPosition.y = Math.max(0, player.position.y - 1);
              break;
            case 'south':
              newPosition.y = Math.min(gameState.maze.length - 1, player.position.y + 1);
              break;
            case 'east':
              newPosition.x = Math.min(gameState.maze[0].length - 1, player.position.x + 1);
              break;
            case 'west':
              newPosition.x = Math.max(0, player.position.x - 1);
              break;
          }

          // 壁との衝突チェック
          if (gameState.maze[newPosition.y][newPosition.x] === 1) return state;

          const newPlayers = {
            ...gameState.players,
            [playerId]: {
              ...player,
              position: newPosition,
            },
          };

          return {
            sessions: {
              ...state.sessions,
              [gameId]: {
                state: {
                  ...gameState,
                  players: newPlayers,
                },
                lastUpdated: Date.now(),
              },
            },
          };
        });
      },

      addEffect: (gameId, effect) => {
        set((state) => {
          const session = state.sessions[gameId];
          if (!session) return state;

          return {
            sessions: {
              ...state.sessions,
              [gameId]: {
                state: {
                  ...session.state,
                  effects: [...session.state.effects, effect],
                },
                lastUpdated: Date.now(),
              },
            },
          };
        });
      },

      resetGame: (gameId) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [gameId]: {
              state: createInitialGameState(gameId),
              lastUpdated: Date.now(),
            },
          },
        }));
      },
    }),
    {
      name: 'game-store',
    }
  )
); 
