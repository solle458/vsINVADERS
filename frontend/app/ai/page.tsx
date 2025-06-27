'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AIModel {
  id: string
  name: string
  description: string
  file_path: string
  status: string
  win_rate: number
  total_games: number
  created_at: string
}

export default function AIPage() {
  const router = useRouter()
  const [aiModels, setAiModels] = useState<AIModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [aiName, setAiName] = useState('')
  const [aiDescription, setAiDescription] = useState('')
  const [dragActive, setDragActive] = useState(false)

  // Fetch AI models from backend
  const fetchAIModels = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/ai')
      if (response.ok) {
        const models = await response.json()
        setAiModels(models || [])
      } else {
        console.warn('No AI models found or API not ready')
        setAiModels([])
      }
    } catch (err) {
      console.error('Failed to fetch AI models:', err)
      setError('🤖 AI Lab connection failed. Feature coming in Phase 2!')
      setAiModels([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAIModels()
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.name.endsWith('.py')) {
      setSelectedFile(file)
    } else {
      alert('🚨 Please select a Python (.py) file!')
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file && file.name.endsWith('.py')) {
      setSelectedFile(file)
    } else {
      alert('🚨 Please select a Python (.py) file!')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !aiName.trim()) {
      alert('🚨 Please select a file and enter AI name!')
      return
    }

    setIsUploading(true)
    // Simulate upload for now (Phase 2 implementation)
    setTimeout(() => {
      alert('🤖 AI Upload simulated! Full implementation coming in Phase 2.')
      setIsUploading(false)
      setSelectedFile(null)
      setAiName('')
      setAiDescription('')
    }, 2000)
  }

  const mockAIModels: AIModel[] = [
    {
      id: 'demo-ai-1',
      name: 'Stellar Hunter',
      description: '積極的攻撃型AI\n前方攻撃を重視した戦略',
      file_path: '/uploads/stellar_hunter.py',
      status: 'active',
      win_rate: 0.78,
      total_games: 125,
      created_at: '2024-12-15T10:00:00Z'
    },
    {
      id: 'demo-ai-2',
      name: 'Cosmic Defender',
      description: '防御重視型AI\n安全な位置を確保する戦術',
      file_path: '/uploads/cosmic_defender.py',
      status: 'active',
      win_rate: 0.65,
      total_games: 89,
      created_at: '2024-12-14T15:30:00Z'
    },
    {
      id: 'demo-ai-3',
      name: 'Quantum Strategist',
      description: '高度戦略AI\n複数手先を読む戦略',
      file_path: '/uploads/quantum_strategist.py',
      status: 'inactive',
      win_rate: 0.89,
      total_games: 67,
      created_at: '2024-12-13T09:15:00Z'
    }
  ]

  const displayModels = aiModels.length > 0 ? aiModels : mockAIModels

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <span className="text-5xl mr-4">🤖</span>
          <h1 className="text-4xl md:text-6xl font-pixel glow-text text-alien-green">
            AI LAB
          </h1>
          <span className="text-5xl ml-4">🧠</span>
        </div>
        <p className="text-xl font-cosmic text-cosmic-white">
          🌌 Create & Manage Your Cosmic AI Warriors 🌌
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Upload Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-pixel text-star-yellow mb-6 text-center glow-text">
            🚀 UPLOAD NEW AI 🚀
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* File Upload */}
            <div className="control-panel">
              <div className="font-pixel text-sm text-laser-cyan mb-4">
                📁 AI FILE UPLOAD
              </div>
              
              <div
                className={`
                  border-3 border-dashed rounded-lg p-8 text-center transition-all duration-300
                  ${dragActive
                    ? 'border-star-yellow bg-star-yellow/20 scale-105'
                    : selectedFile
                      ? 'border-alien-green bg-alien-green/20'
                      : 'border-cosmic-blue/50 hover:border-laser-cyan'
                  }
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-3">
                    <div className="text-4xl">✅</div>
                    <div className="font-pixel text-alien-green text-sm">
                      {selectedFile.name}
                    </div>
                    <div className="font-cosmic text-xs text-cosmic-white/70">
                      File size: {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-6xl">📤</div>
                    <div className="font-pixel text-cosmic-white text-sm">
                      Drag & Drop Python File
                    </div>
                    <div className="font-cosmic text-xs text-cosmic-white/60">
                      Or click to browse (.py files only)
                    </div>
                  </div>
                )}
                
                <input
                  type="file"
                  accept=".py"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* AI Info */}
            <div className="control-panel">
              <div className="font-pixel text-sm text-laser-cyan mb-4">
                🤖 AI INFORMATION
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="font-pixel text-xs text-cosmic-white block mb-2">
                    AI Name *
                  </label>
                  <input
                    type="text"
                    value={aiName}
                    onChange={(e) => setAiName(e.target.value)}
                    placeholder="Enter AI name..."
                    className="w-full bg-space-dark/50 border-2 border-cosmic-blue/50 rounded-lg px-3 py-2 text-cosmic-white font-cosmic text-sm focus:border-laser-cyan focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="font-pixel text-xs text-cosmic-white block mb-2">
                    Description
                  </label>
                  <textarea
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    placeholder="Describe your AI strategy..."
                    rows={4}
                    className="w-full bg-space-dark/50 border-2 border-cosmic-blue/50 rounded-lg px-3 py-2 text-cosmic-white font-cosmic text-sm focus:border-laser-cyan focus:outline-none resize-none"
                  />
                </div>
                
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || !aiName.trim() || isUploading}
                  className={`
                    w-full pixel-button text-sm py-3
                    ${(!selectedFile || !aiName.trim() || isUploading) 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:shadow-glow-green'
                    }
                  `}
                >
                  {isUploading ? '🔄 Uploading...' : '🚀 Upload AI'}
                </button>
              </div>
            </div>
          </div>

          {/* Phase 2 Notice */}
          <div className="mt-6 text-center">
            <div className="bg-gradient-to-r from-nebula-purple/30 to-cosmic-blue/30 border border-star-yellow/50 rounded-lg p-4 inline-block">
              <div className="font-pixel text-xs text-star-yellow">
                🚧 Coming in Phase 2: Full AI Upload & Docker Execution 🚧
              </div>
            </div>
          </div>
        </div>

        {/* AI Models List */}
        <div>
          <h2 className="text-2xl font-pixel text-star-yellow mb-6 text-center glow-text">
            🤖 YOUR AI FLEET 🤖
          </h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 animate-pulse">🔄</div>
              <div className="font-pixel text-cosmic-white">Loading AI models...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚠️</div>
              <div className="font-pixel text-danger-red mb-4">{error}</div>
              <div className="font-cosmic text-cosmic-white/70 text-sm">
                Currently showing demo models. Real AI management coming in Phase 2!
              </div>
            </div>
          ) : null}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayModels.map((ai) => (
              <div
                key={ai.id}
                className={`
                  control-panel relative transition-all duration-300 hover:scale-105
                  ${ai.status === 'active' 
                    ? 'border-alien-green shadow-glow-green' 
                    : 'border-cosmic-blue/50 opacity-75'
                  }
                `}
              >
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`
                    font-pixel text-xs px-2 py-1 rounded-lg
                    ${ai.status === 'active' 
                      ? 'bg-alien-green/30 text-alien-green border border-alien-green' 
                      : 'bg-cosmic-blue/30 text-cosmic-blue border border-cosmic-blue'
                    }
                  `}>
                    {ai.status.toUpperCase()}
                  </span>
                </div>

                {/* AI Info */}
                <div className="mb-4">
                  <h3 className="font-pixel text-lg text-cosmic-white mb-2">
                    {ai.name}
                  </h3>
                  <p className="font-cosmic text-sm text-cosmic-white/80 leading-relaxed whitespace-pre-line">
                    {ai.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="font-pixel text-xs text-laser-cyan">WIN RATE</div>
                    <div className="font-pixel text-lg text-star-yellow">
                      {(ai.win_rate * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-pixel text-xs text-laser-cyan">BATTLES</div>
                    <div className="font-pixel text-lg text-alien-green">
                      {ai.total_games}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button className="font-pixel text-xs py-2 px-3 bg-cosmic-blue/30 border border-cosmic-blue rounded-lg text-cosmic-white hover:border-laser-cyan transition-all">
                    ⚔️ BATTLE
                  </button>
                  <button className="font-pixel text-xs py-2 px-3 bg-danger-red/30 border border-danger-red rounded-lg text-danger-red hover:border-star-yellow transition-all">
                    🗑️ DELETE
                  </button>
                </div>

                {/* Created Date */}
                <div className="mt-3 pt-3 border-t border-cosmic-blue/30">
                  <div className="font-cosmic text-xs text-cosmic-white/50">
                    Created: {new Date(ai.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {displayModels.length === 0 && !isLoading && !error && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <div className="font-pixel text-xl text-cosmic-white mb-4">
                No AI Warriors Yet
              </div>
              <div className="font-cosmic text-cosmic-white/70">
                Upload your first AI to start battling!
              </div>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
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
