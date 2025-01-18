/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/components/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        keyframes: {
          moveLeftToRight: {
            '0%': {
              transform: 'translateX(-100%)',
            },
            '100%': {
              transform: 'translateX(100%)',
            },
          },
        },
        animation: {
          moveLeftToRight: 'moveLeftToRight 10s linear infinite',
        },
      },
    },
    plugins: [],
  }