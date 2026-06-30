import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#081E3F',
        oxford: '#0A3D62',
        skysoft: '#EAF6FF',
        gold: '#F4B942'
      }
    }
  },
  plugins: []
};

export default config;
