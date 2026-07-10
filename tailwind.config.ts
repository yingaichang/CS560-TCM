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
        'cream': '#F6F1E8',
        'surface': '#FEF9F0',
        'primary': '#46644D',
        'primary-soft': '#5E7D65',
        'wood': '#735A36',
        'wood-light': '#C8A97E',
        'gold-soft': '#D6C3A5',
        'ink': '#4B4B4B',
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
