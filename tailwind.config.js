/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef4fb',
          100: '#d9e6f5',
          700: '#1e3a5f',
          800: '#16324f',
          900: '#0f1f33',
          950: '#0b1726'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px -16px rgba(15, 23, 42, 0.18)'
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(0.85)' }
        }
      },
      animation: {
        'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
