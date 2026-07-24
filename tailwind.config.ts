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
        'cream': '#FAF8F2',
        'surface': '#FAF8F2',
        'primary': '#355C46',
        'primary-soft': '#6F8A72',
        'wood': '#A78D60',
        'wood-light': '#EEE5D6',
        'gold-soft': '#A78D60',
        'ink': '#343A36',
        'tcm-green': '#355C46',
        'tcm-light-green': '#6F8A72',
        'tcm-beige': '#EEE5D6',
        'tcm-dark': '#343A36',
        'tcm-gold': '#A78D60',
        'bg-soft-green': '#E9EFE7',
        'bg-warm': '#FAF8F2',
      },
      backgroundImage: {
        'tcm-gradient': 'linear-gradient(135deg, rgba(74, 124, 89, 0.1) 0%, rgba(107, 168, 118, 0.1) 100%)',
      },
      fontFamily: {
        'chinese': ['Noto Sans TC', 'sans-serif'],
        'display': ['Noto Serif TC', 'serif'],
        'brand': ['Cormorant Garamond', 'Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
