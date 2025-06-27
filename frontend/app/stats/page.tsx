'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface BattleRecord {
  id: number
  game_id: number
  player1_type: string
  player1_id: string
  player2_type: string
  player2_id: string
  winner: string
  total_turns: number
  duration_seconds: number
  created_at: string
}

interface StatsData {
  total_games: number
  human_wins: number
  com_wins: number
  ai_wins: number
  average_game_length: number
  win_rate_by_difficulty: { [key: string]: number }
  recent_games: BattleRecord[]
}

export default function StatsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [timeFilter, setTimeFilter] = useState<string>('all')

  // Fetch stats from backend
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.warn('Stats API not ready')
        // Use mock data for demo
        setStats(mockStatsData)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
      setError('📊 Stats connection failed. Showing demo data!')
      setStats(mockStatsData)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  // Mock data for demonstration
  const mockStatsData: StatsData = {
    total_games: 47,
    human_wins: 23,
    com_wins: 21,
    ai_wins: 3,
    average_game_length: 12.5,
    win_rate_by_difficulty: {
      '1': 0.89,  // Level 1 (Easy)
      '2': 0.67,  // Level 2 (Normal)
      '3': 0.34,  // Level 3 (Hard)
      '4': 0.12   // Level 4 (Extreme)
    },
    recent_games: [
      {
        id: 1,
        game_id: 47,
        player1_type: 'human',
        player1_id: '',
        player2_type: 'com',
        player2_id: '3',
        winner: 'player1',
        total_turns: 15,
        duration_seconds: 180,
        created_at: '2024-12-18T10:30:00Z'
      },
      {
        id: 2,
        game_id: 46,
        player1_type: 'human',
        player1_id: '',
        player2_type: 'com',
        player2_id: '4',
        winner: 'player2',
        total_turns: 8,
        duration_seconds: 95,
        created_at: '2024-12-18T09:45:00Z'
      },
      {
        id: 3,
        game_id: 45,
        player1_type: 'human',
        player1_id: '',
        player2_type: 'com',
        player2_id: '2',
        winner: 'player1',
        total_turns: 22,
        duration_seconds: 320,
        created_at: '2024-12-18T09:15:00Z'
      }
    ]
  }

  const difficultyNames: { [key: string]: { name: string, color: string } } = {
    '1': { name: 'Rookie Bot', color: 'alien-green' },
    '2': { name: 'Scout AI', color: 'star-yellow' },
    '3': { name: 'Tactical AI', color: 'cosmic-blue' },
    '4': { name: 'Elite Commander', color: 'danger-red' }
  }

  const getWinnerDisplay = (winner: string, player1_type: string, player2_type: string) => {
    if (winner === 'player1') {
      return { icon: player1_type === 'human' ? '🧑‍🚀' : '🤖', text: player1_type === 'human' ? 'Human' : 'AI', color: 'laser-cyan' }
    } else {
      return { icon: player2_type === 'com' ? '🤖' : '🧑‍🚀', text: player2_type === 'com' ? 'COM AI' : 'Human', color: 'danger-red' }
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📊</div>
          <div className="font-pixel text-xl text-laser-cyan animate-pulse">
            Loading Battle Statistics...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <span className="text-5xl mr-4">📊</span>
          <h1 className="text-4xl md:text-6xl font-pixel glow-text text-star-yellow">
            BATTLE STATS
          </h1>
          <span className="text-5xl ml-4">📈</span>
        </div>
        <p className="text-xl font-cosmic text-cosmic-white">
          🌌 Cosmic Battle Analytics & Victory Records 🌌
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-8 text-center">
            <div className="bg-gradient-to-r from-star-yellow/30 to-cosmic-blue/30 border border-star-yellow/50 rounded-lg p-4 inline-block">
              <div className="font-pixel text-sm text-star-yellow">
                ⚠️ {error}
              </div>
            </div>
          </div>
        )}

        {stats && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="control-panel text-center">
                <div className="text-4xl mb-2">🎮</div>
                <div className="font-pixel text-2xl text-laser-cyan">{stats.total_games}</div>
                <div className="font-pixel text-xs text-cosmic-white">TOTAL BATTLES</div>
              </div>
              
              <div className="control-panel text-center">
                <div className="text-4xl mb-2">🧑‍🚀</div>
                <div className="font-pixel text-2xl text-alien-green">{stats.human_wins}</div>
                <div className="font-pixel text-xs text-cosmic-white">HUMAN WINS</div>
              </div>
              
              <div className="control-panel text-center">
                <div className="text-4xl mb-2">🤖</div>
                <div className="font-pixel text-2xl text-danger-red">{stats.com_wins}</div>
                <div className="font-pixel text-xs text-cosmic-white">COM AI WINS</div>
              </div>
              
              <div className="control-panel text-center">
                <div className="text-4xl mb-2">⏱️</div>
                <div className="font-pixel text-2xl text-star-yellow">{stats.average_game_length.toFixed(1)}</div>
                <div className="font-pixel text-xs text-cosmic-white">AVG TURNS</div>
              </div>
            </div>

            {/* Win Rate by Difficulty */}
            <div className="mb-12">
              <h2 className="text-2xl font-pixel text-star-yellow mb-6 text-center glow-text">
                🎯 WIN RATE BY DIFFICULTY 🎯
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(stats.win_rate_by_difficulty).map(([level, winRate]) => {
                  const difficulty = difficultyNames[level]
                  return (
                    <div key={level} className="control-panel text-center">
                      <div className="font-pixel text-sm text-cosmic-white mb-2">
                        Level {level}
                      </div>
                      <div className={`font-pixel text-lg text-${difficulty.color} mb-2`}>
                        {difficulty.name}
                      </div>
                      <div className="relative mb-4">
                        <div className="w-full bg-space-dark/50 rounded-lg h-4 overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r from-${difficulty.color} to-${difficulty.color}/60 transition-all duration-1000`}
                            style={{ width: `${winRate * 100}%` }}
                          ></div>
                        </div>
                        <div className={`font-pixel text-xs text-${difficulty.color} mt-1`}>
                          {(winRate * 100).toFixed(0)}% WIN
                        </div>
                      </div>
                      <div className={`
                        font-pixel text-xs px-2 py-1 rounded-lg
                        ${winRate > 0.7 ? 'bg-alien-green/20 text-alien-green' :
                          winRate > 0.4 ? 'bg-star-yellow/20 text-star-yellow' :
                          'bg-danger-red/20 text-danger-red'
                        }
                      `}>
                        {winRate > 0.7 ? 'EASY' : winRate > 0.4 ? 'FAIR' : 'HARD'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent Games */}
            <div className="mb-12">
              <h2 className="text-2xl font-pixel text-star-yellow mb-6 text-center glow-text">
                🚀 RECENT BATTLES 🚀
              </h2>
              
              <div className="space-y-4">
                {stats.recent_games.map((game) => {
                  const winner = getWinnerDisplay(game.winner, game.player1_type, game.player2_type)
                  const difficulty = difficultyNames[game.player2_id]
                  
                  return (
                    <div key={game.id} className="control-panel">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        {/* Game Info */}
                        <div className="text-center">
                          <div className="font-pixel text-sm text-laser-cyan">BATTLE #{game.game_id}</div>
                          <div className="font-cosmic text-xs text-cosmic-white/70">
                            {new Date(game.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {/* Players */}
                        <div className="text-center">
                          <div className="font-pixel text-xs text-cosmic-white mb-1">PLAYERS</div>
                          <div className="flex items-center justify-center space-x-2">
                            <span>🧑‍🚀</span>
                            <span className="font-pixel text-xs text-cosmic-white">VS</span>
                            <span>🤖</span>
                          </div>
                          <div className="font-cosmic text-xs text-cosmic-white/70">
                            Human vs {difficulty?.name || `Level ${game.player2_id}`}
                          </div>
                        </div>
                        
                        {/* Winner */}
                        <div className="text-center">
                          <div className="font-pixel text-xs text-cosmic-white mb-1">WINNER</div>
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-lg">{winner.icon}</span>
                            <span className={`font-pixel text-sm text-${winner.color}`}>
                              {winner.text}
                            </span>
                          </div>
                        </div>
                        
                        {/* Game Stats */}
                        <div className="text-center">
                          <div className="font-pixel text-xs text-cosmic-white mb-1">DURATION</div>
                          <div className="font-pixel text-sm text-star-yellow">
                            {formatDuration(game.duration_seconds)}
                          </div>
                          <div className="font-cosmic text-xs text-cosmic-white/70">
                            {game.total_turns} turns
                          </div>
                        </div>
                        
                        {/* Action */}
                        <div className="text-center">
                          <button className="font-pixel text-xs py-2 px-3 bg-cosmic-blue/30 border border-cosmic-blue rounded-lg text-cosmic-white hover:border-laser-cyan transition-all">
                            📹 REPLAY
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Performance Analysis */}
            <div className="mb-12">
              <h2 className="text-2xl font-pixel text-star-yellow mb-6 text-center glow-text">
                📈 PERFORMANCE ANALYSIS 📈
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="control-panel text-center">
                  <div className="text-4xl mb-3">🏆</div>
                  <div className="font-pixel text-lg text-alien-green mb-2">
                    {stats.total_games > 0 ? ((stats.human_wins / stats.total_games) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="font-pixel text-xs text-cosmic-white">OVERALL WIN RATE</div>
                  <div className="mt-3">
                    {((stats.human_wins / stats.total_games) * 100) > 60 ? (
                      <span className="font-pixel text-xs bg-alien-green/20 text-alien-green px-2 py-1 rounded-lg">
                        🌟 STELLAR PILOT
                      </span>
                    ) : ((stats.human_wins / stats.total_games) * 100) > 40 ? (
                      <span className="font-pixel text-xs bg-star-yellow/20 text-star-yellow px-2 py-1 rounded-lg">
                        ⚡ SPACE CADET
                      </span>
                    ) : (
                      <span className="font-pixel text-xs bg-danger-red/20 text-danger-red px-2 py-1 rounded-lg">
                        🚀 ROOKIE
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="control-panel text-center">
                  <div className="text-4xl mb-3">🎯</div>
                  <div className="font-pixel text-lg text-laser-cyan mb-2">
                    {Math.max(...Object.keys(stats.win_rate_by_difficulty).filter(level => 
                      stats.win_rate_by_difficulty[level] > 0.5
                    ).map(Number)) || 1}
                  </div>
                  <div className="font-pixel text-xs text-cosmic-white">HIGHEST LEVEL BEATEN</div>
                </div>
                
                <div className="control-panel text-center">
                  <div className="text-4xl mb-3">⚡</div>
                  <div className="font-pixel text-lg text-star-yellow mb-2">
                    {stats.recent_games.length > 0 ? 
                      Math.min(...stats.recent_games.map(g => g.total_turns)) : 0
                    }
                  </div>
                  <div className="font-pixel text-xs text-cosmic-white">FASTEST VICTORY</div>
                  <div className="font-cosmic text-xs text-cosmic-white/70">
                    turns
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 2 Notice */}
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-nebula-purple/30 to-cosmic-blue/30 border border-star-yellow/50 rounded-lg p-4 inline-block">
                <div className="font-pixel text-xs text-star-yellow">
                  🚧 Coming in Phase 3: Advanced Analytics, Charts & AI vs AI Stats 🚧
                </div>
              </div>
            </div>
          </>
        )}

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="pixel-button"
          >
            🏠 Back to Battle Arena
          </button>
        </div>
      </div>
    </div>
  )
} 
