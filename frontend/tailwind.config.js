/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Grafite — deep graphite-navy, structural dark surfaces (sidebar, headings)
        graphite: {
          50: '#f4f5f6',
          100: '#e5e7ea',
          200: '#c8cdd3',
          300: '#a1a9b3',
          400: '#75808d',
          500: '#586371',
          600: '#454e5a',
          700: '#383f49',
          800: '#262b32',
          900: '#191d22',
          950: '#101317',
        },
        // Âmbar — instrument-panel amber, the single accent
        amber: {
          50: '#fdf6ea',
          100: '#faebcd',
          200: '#f4d497',
          300: '#edb85e',
          400: '#e39f38',
          500: '#d38623',
          600: '#b3691a',
          700: '#8f4f18',
          800: '#743f19',
          900: '#603418',
        },
        // Papel — warm neutral paper background
        paper: {
          DEFAULT: '#f7f6f2',
          soft: '#f1efe9',
        },
        // status semantics kept distinct from the accent
        moss: {
          50: '#f0f6f1',
          100: '#dcebde',
          400: '#5a9e6b',
          500: '#3f8451',
          600: '#316b41',
          700: '#28542f',
        },
        rust: {
          50: '#fbeeec',
          100: '#f4d3ce',
          400: '#cf5d47',
          500: '#b8432c',
          600: '#973423',
        },
        steel: {
          50: '#f2f4f5',
          100: '#e2e6e9',
          300: '#aab3bc',
          400: '#87919c',
          500: '#69727d',
          600: '#525a64',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(25, 29, 34, 0.04), 0 1px 3px 0 rgba(25, 29, 34, 0.06)',
        panel: '0 4px 16px -4px rgba(25, 29, 34, 0.10), 0 2px 6px -2px rgba(25, 29, 34, 0.06)',
        lifted: '0 12px 32px -8px rgba(25, 29, 34, 0.18)',
      },
      borderRadius: {
        xl2: '1.125rem',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        modalIn: {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 150ms ease-out',
        modalIn: 'modalIn 180ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
