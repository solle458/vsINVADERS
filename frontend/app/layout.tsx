import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VSmaze - Cosmic INVADER Battle',
  description: 'Epic space battles with AI-powered opponents in a retro pixel universe!',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-space-dark text-cosmic-white min-h-screen`}>
        <div className="cosmic-background">
          <div className="stars-layer"></div>
          <div className="planets-layer"></div>
          <div className="nebula-layer"></div>
        </div>
        
        {/* Header */}
        <header className="relative z-10 bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-sm border-b-2 border-cyan-400 pixel-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="pixel-icon-rocket">🚀</div>
                <h1 className="text-3xl font-bold pixel-text glow-text bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  VSmaze
                </h1>
                <div className="pixel-icon-alien">👾</div>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a href="/" className="pixel-button-sm hover:glow-cyan transition-all">
                  Battle Arena
                </a>
                <a href="/ai" className="pixel-button-sm hover:glow-purple transition-all">
                  AI Lab
                </a>
                <a href="/stats" className="pixel-button-sm hover:glow-green transition-all">
                  Stats
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 container mx-auto px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative z-10 mt-auto bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-sm border-t-2 border-cyan-400 pixel-border">
          <div className="container mx-auto px-4 py-6 text-center">
            <p className="pixel-text text-cyan-300">
              🌌 Powered by Cosmic Intelligence • Battle in the Pixelated Universe 🌌
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
} 
