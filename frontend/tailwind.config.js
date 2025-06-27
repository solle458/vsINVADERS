/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'space-dark': '#0a0a0a',
        'nebula-purple': '#6d28d9',
        'cosmic-blue': '#1e40af',
        'alien-green': '#10b981',
        'laser-cyan': '#06b6d4',
        'star-yellow': '#fbbf24',
        'danger-red': '#ef4444',
        'cosmic-white': '#f8fafc',
      },
      fontFamily: {
        'pixel': ['Press Start 2P', 'monospace'],
        'cosmic': ['Orbitron', 'sans-serif'],
      },
      animation: {
        'drift': 'drift 20s linear infinite',
        'float': 'float 30s ease-in-out infinite',
        'pulse-cosmic': 'pulse 15s ease-in-out infinite',
        'bounce-pixel': 'bounce 2s ease-in-out infinite',
        'glow': 'textGlow 2s ease-in-out infinite alternate',
      },
      boxShadow: {
        'cosmic': '0 0 30px rgba(6, 182, 212, 0.3), inset 0 0 30px rgba(109, 40, 217, 0.1)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.7)',
        'glow-purple': '0 0 20px rgba(109, 40, 217, 0.7)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.7)',
      },
    },
  },
  plugins: [],
} 
