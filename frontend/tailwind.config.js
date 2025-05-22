/** @type {import('tailwindcss').Config} */
export default {
  content: [
      "./index.html",
      "./src/**/*.{js,jsx}"
  ],
  theme: {
      extend: {
          colors: {
              primary: {
                  50: '#fff4e6',
                  100: '#ffe8cc',
                  200: '#ffd199',
                  300: '#ffba66',
                  400: '#ffa333',
                  500: '#ff8c00', /* Exctel orange */
                  600: '#e67700',
                  700: '#b35c00',
                  800: '#804200',
                  900: '#4d2800',
              },
              secondary: {
                  50: '#f6f6f6',
                  100: '#e7e7e7',
                  200: '#d1d1d1',
                  300: '#b0b0b0',
                  400: '#888888',
                  500: '#6d6d6d',
                  600: '#5d5d5d',
                  700: '#4f4f4f',
                  800: '#333333', /* Dark gray for text */
                  900: '#111111', /* Almost black */
              },
              accent: {
                  50: '#e6f7ff',
                  100: '#bae3ff',
                  200: '#7cc4ff',
                  300: '#47a3f3',
                  400: '#2186eb',
                  500: '#0967d2',
                  600: '#0552b5',
                  700: '#03449e',
                  800: '#01337d',
                  900: '#002159',
              },
              success: '#10b981',
              warning: '#f59e0b',
              danger: '#ef4444',
              info: '#3b82f6',
          },
          fontFamily: {
              sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
              display: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
          },
          boxShadow: {
              card: '0 4px 20px rgba(0, 0, 0, 0.08)',
              button: '0 2px 8px rgba(0, 0, 0, 0.12)',
              "card-hover": '0 10px 30px rgba(0, 0, 0, 0.15)',
          },
          borderRadius: {
              'xl': '1rem',
              '2xl': '1.5rem',
          },
          backgroundImage: {
              'diagonal-pattern': "linear-gradient(135deg, white 70%, #f0f0f0 70%)",
              'card-gradient': "linear-gradient(160deg, #ffffff 60%, #f6f6f6 100%)",
          }
      },
  },
  plugins: [],
} 