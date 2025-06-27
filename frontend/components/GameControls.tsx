'use client'

import React, { useState } from 'react'

interface GameControlsProps {
  currentPlayer: string
  isPlayerTurn: boolean
  onMove: (direction: string) => void
  onAttack: (direction: string) => void
  onDefend: () => void
  disabled?: boolean
}

type ActionType = 'move' | 'attack' | 'defend'
type Direction = 'up' | 'down' | 'left' | 'right'

const directions: Array<{key: Direction, label: string, icon: string, position: string}> = [
  { key: 'up', label: 'UP', icon: '⬆️', position: 'col-start-2 row-start-1' },
  { key: 'left', label: 'LEFT', icon: '⬅️', position: 'col-start-1 row-start-2' },
  { key: 'right', label: 'RIGHT', icon: '➡️', position: 'col-start-3 row-start-2' },
  { key: 'down', label: 'DOWN', icon: '⬇️', position: 'col-start-2 row-start-3' },
]

export default function GameControls({ 
  currentPlayer, 
  isPlayerTurn, 
  onMove, 
  onAttack, 
  onDefend, 
  disabled = false 
}: GameControlsProps) {
  const [selectedAction, setSelectedAction] = useState<ActionType>('move')
  const [pendingDirection, setPendingDirection] = useState<Direction | null>(null)

  const handleDirectionClick = (direction: Direction) => {
    if (disabled || !isPlayerTurn) return

    setPendingDirection(direction)
    
    // Execute action based on selected type
    switch (selectedAction) {
      case 'move':
        onMove(direction)
        break
      case 'attack':
        onAttack(direction)
        break
    }
    
    // Reset pending direction after a short delay
    setTimeout(() => setPendingDirection(null), 500)
  }

  const handleDefend = () => {
    if (disabled || !isPlayerTurn) return
    setSelectedAction('defend')
    onDefend()
  }

  const isDisabled = disabled || !isPlayerTurn

  return (
    <div className="control-panel max-w-md mx-auto">
      {/* Player Status */}
      <div className="text-center mb-6">
        <div className="font-pixel text-lg text-star-yellow mb-2">
          🎮 COSMIC CONTROLS 🎮
        </div>
        <div className={`
          font-pixel text-sm px-4 py-2 rounded-lg inline-block
          ${isPlayerTurn 
            ? 'text-alien-green bg-alien-green/20 border border-alien-green' 
            : 'text-cosmic-white/60 bg-cosmic-blue/20 border border-cosmic-blue/50'
          }
        `}>
          {isPlayerTurn ? '⚡ YOUR TURN ⚡' : '⏳ WAITING...'}
        </div>
      </div>

      {/* Action Selection */}
      <div className="mb-6">
        <div className="font-pixel text-sm text-laser-cyan mb-3 text-center">
          SELECT ACTION
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setSelectedAction('move')}
            disabled={isDisabled}
            className={`
              font-pixel text-xs py-3 px-2 rounded-lg border-2 transition-all duration-200
              ${selectedAction === 'move'
                ? 'border-alien-green bg-alien-green/30 text-alien-green shadow-glow-green'
                : 'border-cosmic-blue/50 bg-cosmic-blue/20 text-cosmic-white hover:border-alien-green'
              }
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="text-lg mb-1">🚶‍♂️</div>
            MOVE
          </button>
          
          <button
            onClick={() => setSelectedAction('attack')}
            disabled={isDisabled}
            className={`
              font-pixel text-xs py-3 px-2 rounded-lg border-2 transition-all duration-200
              ${selectedAction === 'attack'
                ? 'border-danger-red bg-danger-red/30 text-danger-red shadow-glow-cyan'
                : 'border-cosmic-blue/50 bg-cosmic-blue/20 text-cosmic-white hover:border-danger-red'
              }
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="text-lg mb-1">⚔️</div>
            ATTACK
          </button>
          
          <button
            onClick={handleDefend}
            disabled={isDisabled}
            className={`
              font-pixel text-xs py-3 px-2 rounded-lg border-2 transition-all duration-200
              ${selectedAction === 'defend'
                ? 'border-star-yellow bg-star-yellow/30 text-star-yellow shadow-glow-purple'
                : 'border-cosmic-blue/50 bg-cosmic-blue/20 text-cosmic-white hover:border-star-yellow'
              }
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="text-lg mb-1">🛡️</div>
            DEFEND
          </button>
        </div>
      </div>

      {/* Direction Controls (only for move/attack) */}
      {selectedAction !== 'defend' && (
        <div className="mb-6">
          <div className="font-pixel text-sm text-laser-cyan mb-3 text-center">
            SELECT DIRECTION
          </div>
          
          <div className="grid grid-cols-3 grid-rows-3 gap-2 max-w-xs mx-auto">
            {directions.map((dir) => (
              <button
                key={dir.key}
                onClick={() => handleDirectionClick(dir.key)}
                disabled={isDisabled}
                className={`
                  ${dir.position} w-16 h-16 font-pixel text-xs rounded-lg border-2 transition-all duration-200
                  ${pendingDirection === dir.key
                    ? 'border-star-yellow bg-star-yellow/40 text-star-yellow animate-pulse'
                    : selectedAction === 'move'
                      ? 'border-alien-green/50 bg-alien-green/20 text-alien-green hover:border-alien-green hover:shadow-glow-green'
                      : 'border-danger-red/50 bg-danger-red/20 text-danger-red hover:border-danger-red hover:shadow-glow-cyan'
                  }
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="text-2xl mb-1">{dir.icon}</div>
                <div>{dir.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Description */}
      <div className="text-center">
        <div className="bg-gradient-to-br from-space-dark/80 to-cosmic-blue/20 p-4 rounded-lg border border-laser-cyan/30">
          <div className="font-pixel text-xs text-star-yellow mb-2">
            📖 ACTION INFO
          </div>
          <div className="font-cosmic text-xs text-cosmic-white leading-relaxed">
            {selectedAction === 'move' && '🚶‍♂️ Move to adjacent empty cell'}
            {selectedAction === 'attack' && '⚔️ Attack forward until wall/enemy'}
            {selectedAction === 'defend' && '🛡️ Skip turn and stay defensive'}
          </div>
        </div>
      </div>

      {/* Quick Help */}
      <div className="mt-6 text-center">
        <div className="font-pixel text-xs text-cosmic-white/60">
          💡 TIP: Attack destroys walls and hits enemies!
        </div>
      </div>
    </div>
  )
} 
