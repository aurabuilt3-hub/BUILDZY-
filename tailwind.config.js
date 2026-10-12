/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F7FF',
          100: '#E0F0FE',
          200: '#BAE0FD',
          300: '#7DC8FC',
          400: '#20B8F5',
          500: '#168BF5',
          600: '#0E6FD4',
          700: '#0B57A8',
          800: '#0E4B8A',
          900: '#113F72',
        },
        navy: {
          900: '#101D3A',
          800: '#1A2A4E',
          700: '#233863',
          600: '#344C7D',
        },
        surface: {
          bg: '#F5F9FF',
          card: '#FFFFFF',
          border: '#E3EAF4',
          subtle: '#EEF4FC',
        },
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(22, 139, 245, 0.08), 0 2px 6px -1px rgba(16, 29, 58, 0.04)',
        'soft-lg': '0 10px 30px -4px rgba(22, 139, 245, 0.12), 0 4px 12px -2px rgba(16, 29, 58, 0.05)',
        'soft-xl': '0 20px 40px -6px rgba(22, 139, 245, 0.16), 0 8px 16px -3px rgba(16, 29, 58, 0.06)',
        'blue-glow': '0 0 25px -3px rgba(32, 184, 245, 0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
