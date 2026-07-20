/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nature Green
        primary: {
          DEFAULT: '#2D5A27',
          dark: '#154212',
          light: '#a1d494',
          container: '#bcf0ae',
        },
        // Warm Yellow
        secondary: {
          DEFAULT: '#F4B41A',
          dark: '#7b5800',
          light: '#ffdea5',
          container: '#fdbb24',
        },
        // Earthy Terracotta
        danger: {
          DEFAULT: '#C05A3E',
          dark: '#6d1d06',
          light: '#ffdbd1',
          container: '#ffdad6',
        },
        // Soft Minimalist cream and sand tones
        background: '#fbf9f5',
        surface: '#ffffff',
        sand: '#eae8e4',
        stone: '#dbdad6',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },
      boxShadow: {
        nest: '0 8px 32px rgba(21, 66, 18, 0.05)',
        'nest-elevated': '0 16px 48px rgba(21, 66, 18, 0.12)',
      }
    },
  },
  plugins: [],
}
