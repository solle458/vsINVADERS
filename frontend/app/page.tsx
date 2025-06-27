'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

interface GameMode {
  id: string
  title: string
  description: string
  icon: string
  color: string
}

interface COMLevel {
  level: number
  name: string
  description: string
  difficulty: string
  color: string
}

const gameModes: GameMode[] = [
  {
    id: 'human_vs_com',
    title: 'Human vs COM',
    description: '人間 vs AI対戦モード\n宇宙の最強AI相手に腕試し！',
    icon: '🧑‍🚀',
    color: 'laser-cyan'
  },
  {
    id: 'ai_vs_com',
    title: 'AI vs COM',
    description: 'あなたのAI vs COM AI\n自作AIで宇宙制覇を目指せ！',
    icon: '🤖',
    color: 'alien-green'
  },
  {
    id: 'ai_vs_ai',
    title: 'AI vs AI',
    description: 'AI同士の宇宙大戦\n究極のAI対決を観戦しよう！',
    icon: '👾',
    color: 'nebula-purple'
  }
]

const comLevels: COMLevel[] = [
  {
    level: 1,
    name: 'Rookie Bot',
    description: 'ランダム行動\n新米宇宙パイロット',
    difficulty: 'EASY',
    color: 'alien-green'
  },
  {
    level: 2,
    name: 'Scout AI',
    description: '単純戦略\n基本的な攻撃AI',
    difficulty: 'NORMAL',
    color: 'star-yellow'
  },
  {
    level: 3,
    name: 'Tactical AI',
    description: '中級戦略\n防御も考慮する賢いAI',
    difficulty: 'HARD',
    color: 'cosmic-blue'
  },
  {
    level: 4,
    name: 'Elite Commander',
    description: '高級戦略\n先読み戦術の最強AI',
    difficulty: 'EXTREME',
    color: 'danger-red'
  }
]

export default function HomePage() {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<number>(2)
  const [isCreatingGame, setIsCreatingGame] = useState(false)

  const handleStartGame = async () => {
    if (!selectedMode) return
    
    setIsCreatingGame(true)
    
    try {
      // Create game via Backend API
      const response = await fetch('http://localhost:8080/api/v1/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player1_type: selectedMode === 'human_vs_com' ? 'human' : 'ai',
          player2_type: 'com',
          player2_id: selectedLevel.toString()
        }),
      })
      
      if (response.ok) {
        const game = await response.json()
        router.push(`/game/${game.id}`)
      } else {
        throw new Error('Failed to create game')
      }
    } catch (error) {
      console.error('Game creation failed:', error)
      alert('🚨 Cosmic Error: Failed to create game. Check if backend is running!')
    } finally {
      setIsCreatingGame(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <span className="text-6xl pixel-icon-rocket mr-4">🚀</span>
          <h1 className="text-6xl md:text-8xl font-pixel glow-text bg-gradient-to-r from-laser-cyan via-star-yellow to-nebula-purple bg-clip-text text-transparent">
            VSMAZE
          </h1>
          <span className="text-6xl pixel-icon-alien ml-4">👾</span>
        </div>
        
        <p className="text-xl md:text-2xl font-cosmic text-cosmic-white mb-4">
          🌌 Cosmic INVADER Battle Arena 🌌
        </p>
        
        <p className="font-pixel text-laser-cyan text-sm md:text-base">
          Choose Your Destiny in the Pixelated Universe!
        </p>
      </div>

      {/* Game Mode Selection */}
      <div className="w-full max-w-6xl mb-8">
        <h2 className="text-2xl md:text-3xl font-pixel text-center text-star-yellow mb-8 glow-text">
          🎮 Select Battle Mode 🎮
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {gameModes.map((mode) => (
            <div
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`
                relative cursor-pointer p-6 rounded-lg border-4 transition-all duration-300
                ${selectedMode === mode.id 
                  ? `border-${mode.color} shadow-glow-cyan bg-gradient-to-br from-nebula-purple/30 to-cosmic-blue/30` 
                  : 'border-cosmic-blue/50 hover:border-laser-cyan bg-gradient-to-br from-space-dark/80 to-cosmic-blue/20'
                }
                backdrop-blur-sm
              `}
            >
              <div className="text-center">
                <div className="text-5xl mb-4 pixel-icon-rocket">{mode.icon}</div>
                <h3 className="font-pixel text-lg text-cosmic-white mb-3">{mode.title}</h3>
                <p className="font-cosmic text-cosmic-white/80 text-sm leading-relaxed whitespace-pre-line">
                  {mode.description}
                </p>
              </div>
              
              {selectedMode === mode.id && (
                <div className="absolute top-2 right-2">
                  <span className="text-2xl">✨</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* COM Level Selection - Show only for selected modes */}
      {selectedMode && (
        <div className="w-full max-w-6xl mb-8">
          <h2 className="text-xl md:text-2xl font-pixel text-center text-alien-green mb-6 glow-text">
            🤖 Select AI Difficulty 🤖
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {comLevels.map((level) => (
              <div
                key={level.level}
                onClick={() => setSelectedLevel(level.level)}
                className={`
                  relative cursor-pointer p-4 rounded-lg border-3 transition-all duration-300 text-center
                  ${selectedLevel === level.level 
                    ? `border-${level.color} shadow-glow-green bg-gradient-to-br from-${level.color}/20 to-space-dark/80` 
                    : 'border-cosmic-blue/30 hover:border-alien-green bg-gradient-to-br from-space-dark/60 to-cosmic-blue/10'
                  }
                  backdrop-blur-sm
                `}
              >
                <div className="font-pixel text-xs text-cosmic-white mb-2">
                  Level {level.level}
                </div>
                <div className="font-pixel text-sm text-star-yellow mb-2">
                  {level.name}
                </div>
                <div className={`font-pixel text-xs text-${level.color} mb-2`}>
                  {level.difficulty}
                </div>
                <div className="font-cosmic text-xs text-cosmic-white/70 leading-relaxed whitespace-pre-line">
                  {level.description}
                </div>
                
                {selectedLevel === level.level && (
                  <div className="absolute top-1 right-1">
                    <span className="text-lg">⭐</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start Battle Button */}
      {selectedMode && (
        <div className="text-center">
          <button
            onClick={handleStartGame}
            disabled={isCreatingGame}
            className={`
              pixel-button text-xl px-8 py-4 mb-4
              ${isCreatingGame ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-glow-cyan'}
            `}
          >
            {isCreatingGame ? (
              <>🔄 Creating Battle...</>
            ) : (
              <>🚀 START COSMIC BATTLE! 🚀</>
            )}
          </button>
          
          <p className="font-pixel text-xs text-cosmic-white/60">
            Selected: {gameModes.find(m => m.id === selectedMode)?.title} vs Level {selectedLevel}
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-12 max-w-4xl text-center">
        <h3 className="font-pixel text-lg text-star-yellow mb-4">🎯 Battle Rules 🎯</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div className="bg-gradient-to-br from-cosmic-blue/20 to-space-dark/80 p-4 rounded-lg border border-laser-cyan/30">
            <h4 className="font-pixel text-laser-cyan mb-2">⚔️ Combat System</h4>
            <ul className="font-cosmic text-cosmic-white/80 text-left space-y-1">
              <li>• 15×15 pixel battlefield</li>
              <li>• Front-attack until wall/enemy</li>
              <li>• One hit = Victory!</li>
              <li>• Destroy walls to clear path</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-nebula-purple/20 to-space-dark/80 p-4 rounded-lg border border-alien-green/30">
            <h4 className="font-pixel text-alien-green mb-2">🎮 Controls</h4>
            <ul className="font-cosmic text-cosmic-white/80 text-left space-y-1">
              <li>• Move: Arrow keys</li>
              <li>• Attack: Space + direction</li>
              <li>• Defend: Wait for turn</li>
              <li>• Strategy is everything!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 
