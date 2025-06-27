'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import GameBoard from '../../../components/GameBoard'
import GameControls from '../../../components/GameControls'

interface GameState {
  id: number
  player1_type: string
  player1_id: string
  player2_type: string
  player2_id: string
  status: string
  current_turn: number
  game_state: string
  winner?: string
  created_at: string
  updated_at: string
}

interface Move {
  player: string
  action: string
  direction?: string
}

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.id as string

  const [gameData, setGameData] = useState<GameState | null>(null)
  const [gameBoard, setGameBoard] = useState<number[][]>([])
  const [currentPlayer, setCurrentPlayer] = useState<string>('player1')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [isPlayerTurn, setIsPlayerTurn] = useState(false)
  const [turnNumber, setTurnNumber] = useState(1)
  const [gameStatus, setGameStatus] = useState<string>('playing')
  const [isProcessingMove, setIsProcessingMove] = useState(false)

  // Fetch game state from Backend
  const fetchGameState = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/games/${gameId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch game state')
      }
      
      const gameData: GameState = await response.json()
      setGameData(gameData)
      
      // Parse game board from JSON string
      if (gameData.game_state) {
        const parsedState = JSON.parse(gameData.game_state)
        setGameBoard(parsedState.board || [])
        setCurrentPlayer(parsedState.current_player || 'player1')
        setTurnNumber(parsedState.turn_number || 1)
      }
      
      setGameStatus(gameData.status)
      setIsPlayerTurn(gameData.player1_type === 'human' && currentPlayer === 'player1')
      
    } catch (err) {
      console.error('Failed to fetch game state:', err)
      setError('🚨 Failed to load game. Check if backend is running!')
    } finally {
      setIsLoading(false)
    }
  }, [gameId, currentPlayer])

  // Start game if not started
  const startGame = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/games/${gameId}/start`, {
        method: 'POST',
      })
      
      if (response.ok) {
        await fetchGameState()
      } else {
        throw new Error('Failed to start game')
      }
    } catch (err) {
      console.error('Failed to start game:', err)
      setError('🚨 Failed to start game')
    }
  }

  // Submit player move to Backend
  const submitMove = async (move: Move) => {
    if (isProcessingMove) return
    
    setIsProcessingMove(true)
    try {
      const response = await fetch(`http://localhost:8080/api/v1/games/${gameId}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(move),
      })
      
      if (response.ok) {
        // Fetch updated game state
        setTimeout(fetchGameState, 500) // Small delay to ensure backend processing
      } else {
        const errorData = await response.text()
        throw new Error(errorData || 'Move failed')
      }
    } catch (err) {
      console.error('Move failed:', err)
      setError(`🚨 Move failed: ${err}`)
    } finally {
      setIsProcessingMove(false)
    }
  }

  // Game control handlers
  const handleMove = (direction: string) => {
    submitMove({
      player: 'player1',
      action: 'move',
      direction: direction
    })
  }

  const handleAttack = (direction: string) => {
    submitMove({
      player: 'player1',
      action: 'attack',
      direction: direction
    })
  }

  const handleDefend = () => {
    submitMove({
      player: 'player1',
      action: 'defend'
    })
  }

  const handleBackToMenu = () => {
    router.push('/')
  }

  // Initial load
  useEffect(() => {
    if (gameId) {
      fetchGameState()
    }
  }, [gameId, fetchGameState])

  // Auto-refresh game state
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameStatus === 'playing' && !isProcessingMove) {
        fetchGameState()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [fetchGameState, gameStatus, isProcessingMove])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🚀</div>
          <div className="font-pixel text-xl text-laser-cyan animate-pulse">
            Loading Cosmic Battle...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🚨</div>
          <div className="font-pixel text-xl text-danger-red mb-4">
            ERROR
          </div>
          <div className="font-cosmic text-cosmic-white mb-6">
            {error}
          </div>
          <button
            onClick={handleBackToMenu}
            className="pixel-button"
          >
            🏠 Back to Menu
          </button>
        </div>
      </div>
    )
  }

  if (!gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❓</div>
          <div className="font-pixel text-xl text-cosmic-white">
            Game not found
          </div>
        </div>
      </div>
    )
  }

  // Game needs to be started
  if (gameData.status === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <div className="font-pixel text-xl text-star-yellow mb-6">
            Battle Ready!
          </div>
          <button
            onClick={startGame}
            className="pixel-button text-xl px-8 py-4"
          >
            🚀 START COSMIC BATTLE! 🚀
          </button>
        </div>
      </div>
    )
  }

  // Game finished
  if (gameData.status === 'finished') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">
            {gameData.winner === 'player1' ? '🏆' : '💥'}
          </div>
          <div className="font-pixel text-3xl text-star-yellow mb-4">
            BATTLE COMPLETE!
          </div>
          <div className="font-cosmic text-xl text-cosmic-white mb-8">
            Winner: {gameData.winner === 'player1' ? '🧑‍🚀 Human Victory!' : '🤖 COM AI Victory!'}
          </div>
          <div className="space-x-4">
            <button
              onClick={handleBackToMenu}
              className="pixel-button"
            >
              🏠 Back to Menu
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      {/* Game Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <h1 className="text-3xl md:text-4xl font-pixel glow-text text-star-yellow">
            🚀 COSMIC BATTLE #{gameId} 🚀
          </h1>
        </div>
        
        <div className="flex items-center justify-center space-x-8 text-sm font-pixel">
          <div className="text-laser-cyan">
            Turn: {turnNumber}
          </div>
          <div className="text-alien-green">
            Status: {gameStatus.toUpperCase()}
          </div>
          <div className="text-cosmic-white">
            Mode: {gameData.player1_type.toUpperCase()} vs {gameData.player2_type.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {/* Game Board - Center */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          {gameBoard.length > 0 ? (
            <GameBoard
              gameState={gameBoard}
              currentPlayer={currentPlayer}
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <div className="font-pixel text-cosmic-white">
                Initializing Battle Arena...
              </div>
            </div>
          )}
        </div>

        {/* Game Controls - Right */}
        <div className="order-1 lg:order-2">
          <GameControls
            currentPlayer={currentPlayer}
            isPlayerTurn={isPlayerTurn && !isProcessingMove}
            onMove={handleMove}
            onAttack={handleAttack}
            onDefend={handleDefend}
            disabled={isProcessingMove}
          />
          
          {/* Game Info */}
          <div className="mt-8">
            <div className="bg-gradient-to-br from-space-dark/80 to-cosmic-blue/20 p-4 rounded-lg border border-laser-cyan/30">
              <div className="font-pixel text-sm text-star-yellow mb-3">
                📊 BATTLE INFO
              </div>
              <div className="space-y-2 text-xs font-cosmic text-cosmic-white">
                <div>🎮 Player 1: {gameData.player1_type.toUpperCase()}</div>
                <div>🤖 Player 2: {gameData.player2_type.toUpperCase()} Level {gameData.player2_id}</div>
                <div>⏰ Turn: {turnNumber}</div>
                <div>🎯 Current: {currentPlayer === 'player1' ? 'Human' : 'COM AI'}</div>
                {isProcessingMove && (
                  <div className="text-star-yellow animate-pulse">
                    🔄 Processing move...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <button
              onClick={handleBackToMenu}
              className="font-pixel text-xs py-2 px-4 bg-cosmic-blue/30 border border-cosmic-blue rounded-lg text-cosmic-white hover:border-laser-cyan transition-all"
            >
              🏠 Back to Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 
