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
        'tcm-green': '#4a7c59',
        'tcm-light-green': '#6ba876',
        'tcm-beige': '#e8dcc8',
        'tcm-dark': '#2d3436',
        'tcm-gold': '#c9a961',
      },
      backgroundImage: {
        'tcm-gradient': 'linear-gradient(135deg, rgba(74, 124, 89, 0.1) 0%, rgba(107, 168, 118, 0.1) 100%)',
      },
      fontFamily: {
        'chinese': ['Noto Sans TC', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
