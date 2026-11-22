/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#1B1F2A',
        card: '#2A2F3B',
        sidebar: '#12141C',
        overlay: '#2F3543',
        hover: '#333948',
        line: '#3A4050',
        brand: { DEFAULT: '#3C83F6', hover: '#2563EB' },
        profit: '#22C35D',
        loss: '#F0425F',
        warning: '#F5A524',
        primary: '#F3F4F6',
        secondary: '#9CA3AF',
      },
      borderRadius: { card: '0.9rem', control: '10px', badge: '6px' },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
