/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nexus: {
          dark: '#0A0F1A',
          surface: '#161B29',
          accent: '#00E5FF',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scanline': 'scanline 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'constellation-pulse': 'constellation-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(0, 229, 255, 0.6)',
            transform: 'scale(1.02)'
          }
        },
        'scanline': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'constellation-pulse': {
          '0%, 100%': { opacity: 0.6 },
          '50%': { opacity: 1 }
        }
      }
    },
  },
  plugins: [],
};