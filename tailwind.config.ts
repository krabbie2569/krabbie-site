import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: '#ff6b00',
          50:  '#fff8f0',
          100: '#fff0e0',
          200: '#ffd0a0',
          300: '#ffb060',
          400: '#ff8c30',
          500: '#ff6b00',
          600: '#e55f00',
          700: '#b84c00',
          800: '#8a3900',
          900: '#5c2600',
        },
        teal: {
          DEFAULT: '#06d6a0',
          light: '#e0fff5',
          dark:  '#049e76',
        },
        krabbie: {
          bg:     '#fff8f0',
          dark:   '#1a0f00',
          border: '#ffe0c0',
          yellow: '#ffd166',
          coral:  '#ff4d4d',
          navy:   '#073b4c',
        },
      },
      fontFamily: {
        // CSS vars set by next/font in layout.tsx; hardcoded names are fallbacks for CSS modules
        sans:    ['var(--font-sarabun)', 'Sarabun', 'sans-serif'],
        syne:    ['var(--font-syne)', 'Syne', 'Sarabun', 'sans-serif'], // Sarabun fallback = Thai chars in headings look right
        mono:    ['var(--font-mono)', 'Space Mono', 'monospace'],
        display: ['Bricolage Grotesque', 'sans-serif'],
      },
      borderRadius: {
        krabbie: '12px',
      },
    },
  },
  plugins: [],
}

export default config
