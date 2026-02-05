import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16a34a', // Green
          dark: '#15803d',
          light: '#22c55e',
        },
        secondary: {
          DEFAULT: '#ea580c', // Orange
          dark: '#c2410c',
          light: '#fb923c',
        },
        siu: {
          green: '#16a34a',
          orange: '#ea580c',
        },
      },
    },
  },
  plugins: [],
}
export default config
