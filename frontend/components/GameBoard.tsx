'use client'

import React from 'react'

interface GameBoardProps {
  gameState: number[][]
  currentPlayer: string
  onCellClick?: (x: number, y: number) => void
  highlightedCells?: Array<{x: number, y: number, type: string}>
}

const cellTypeStyles = {
  0: 'empty', // 空きセル
  1: 'wall',  // 壁
  2: 'player-1', // プレイヤー1
  3: 'player-2', // プレイヤー2
}

const getPlayerIcon = (cellType: number): string => {
  switch (cellType) {
    case 2: return '🧑‍🚀' // Human player
    case 3: return '🤖' // COM AI
    default: return ''
  }
}

const getPlayerName = (cellType: number): string => {
  switch (cellType) {
    case 2: return 'Human'
    case 3: return 'COM AI'
    default: return ''
  }
}

export default function GameBoard({ 
  gameState, 
  currentPlayer, 
  onCellClick,
  highlightedCells = []
}: GameBoardProps) {
  const isHighlighted = (x: number, y: number) => {
    return highlightedCells.some(cell => cell.x === x && cell.y === y)
  }

  const getHighlightType = (x: number, y: number) => {
    const highlighted = highlightedCells.find(cell => cell.x === x && cell.y === y)
    return highlighted?.type || ''
  }

  return (
    <div className="flex flex-col items-center">
      {/* Current Player Indicator */}
      <div className="mb-6 text-center">
        <div className="bg-gradient-to-r from-cosmic-blue/30 to-nebula-purple/30 backdrop-blur-sm border-2 border-laser-cyan rounded-lg p-4 inline-block">
          <div className="font-pixel text-lg text-star-yellow mb-2">
            ⚡ CURRENT TURN ⚡
          </div>
          <div className="flex items-center justify-center space-x-3">
            <span className="text-3xl">
              {currentPlayer === 'player1' ? '🧑‍🚀' : '🤖'}
            </span>
            <span className="font-pixel text-xl text-cosmic-white">
              {currentPlayer === 'player1' ? 'HUMAN' : 'COM AI'}
            </span>
            <div className="w-3 h-3 bg-laser-cyan rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="game-board p-6">
        <div className="grid grid-cols-15 gap-0 bg-space-dark/50 p-2 rounded-lg">
          {gameState.map((row, y) =>
            row.map((cellType, x) => {
              const isHighlightedCell = isHighlighted(x, y)
              const highlightType = getHighlightType(x, y)
              
              return (
                <div
                  key={`${x}-${y}`}
                  onClick={() => onCellClick?.(x, y)}
                  className={`
                    grid-cell relative cursor-pointer transition-all duration-200
                    ${cellTypeStyles[cellType as keyof typeof cellTypeStyles]}
                    ${isHighlightedCell ? 'ring-2 ring-star-yellow ring-opacity-80' : ''}
                    ${highlightType === 'attack' ? 'bg-danger-red/40 animate-pulse' : ''}
                    ${highlightType === 'move' ? 'bg-alien-green/40 animate-pulse' : ''}
                    ${onCellClick ? 'hover:brightness-125' : ''}
                  `}
                  title={`Position: (${x}, ${y}) - ${getPlayerName(cellType)}`}
                >
                  {/* Cell Content */}
                  <div className="w-full h-full flex items-center justify-center">
                    {cellType === 2 || cellType === 3 ? (
                      <span className="text-lg pixel-icon-rocket">
                        {getPlayerIcon(cellType)}
                      </span>
                    ) : cellType === 1 ? (
                      <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 border border-gray-500 rounded-sm relative">
                        <div className="absolute inset-1 bg-gradient-to-tr from-gray-500 to-gray-700 rounded-sm">
                          <div className="w-full h-full bg-gradient-to-br from-gray-400/20 to-transparent rounded-sm"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-space-dark/80 to-cosmic-blue/20 border border-laser-cyan/20 rounded-sm">
                        <div className="w-full h-full bg-gradient-to-tr from-laser-cyan/5 to-transparent rounded-sm"></div>
                      </div>
                    )}
                  </div>

                  {/* Coordinate Labels (only for debug mode) */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="absolute -top-2 -left-2 text-xs text-cosmic-white/40 font-mono">
                      {x},{y}
                    </div>
                  )}

                  {/* Highlight Effect */}
                  {isHighlightedCell && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className={`
                        w-full h-full rounded-sm border-2 animate-pulse
                        ${highlightType === 'attack' ? 'border-danger-red shadow-glow-cyan' : 'border-star-yellow shadow-glow-green'}
                      `}></div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Board Legend */}
        <div className="mt-4 flex justify-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-pixel">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-laser-cyan to-cosmic-blue rounded-sm border border-laser-cyan flex items-center justify-center">
                <span className="text-sm">🧑‍🚀</span>
              </div>
              <span className="text-cosmic-white">Human</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-danger-red to-red-800 rounded-sm border border-danger-red flex items-center justify-center">
                <span className="text-sm">🤖</span>
              </div>
              <span className="text-cosmic-white">COM AI</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-gray-600 to-gray-800 rounded-sm border border-gray-500"></div>
              <span className="text-cosmic-white">Wall</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-space-dark/80 to-cosmic-blue/20 rounded-sm border border-laser-cyan/20"></div>
              <span className="text-cosmic-white">Empty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-md">
        <div className="bg-gradient-to-br from-laser-cyan/20 to-space-dark/80 p-3 rounded-lg border border-laser-cyan/30 text-center">
          <div className="font-pixel text-xs text-laser-cyan">PLAYER 1</div>
          <div className="text-2xl mb-1">🧑‍🚀</div>
          <div className="font-pixel text-xs text-cosmic-white">READY</div>
        </div>
        
        <div className="bg-gradient-to-br from-danger-red/20 to-space-dark/80 p-3 rounded-lg border border-danger-red/30 text-center">
          <div className="font-pixel text-xs text-danger-red">PLAYER 2</div>
          <div className="text-2xl mb-1">🤖</div>
          <div className="font-pixel text-xs text-cosmic-white">READY</div>
        </div>
      </div>
    </div>
  )
}

// CSS for 15x15 grid (add this to globals.css)
/*
.grid-cols-15 {
  grid-template-columns: repeat(15, minmax(0, 1fr));
}
*/ 
