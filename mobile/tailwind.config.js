/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary
        violet: {
          light: '#6366F1',
          DEFAULT: '#6366F1',
          dark: '#818CF8',
        },
        // Backgrounds
        paper: '#F8F9FA',
        'deep-space': '#0F172A',
        // Surfaces
        'surface-light': '#FFFFFF',
        'surface-dark': '#1E293B',
        // Text
        'ink': '#1E293B',
        'ink-secondary': '#64748B',
        'ink-dark': '#F8FAFC',
        'ink-dark-secondary': '#94A3B8',
        // Gamification accents
        streak: '#F59E0B',
        achievement: '#EC4899',
        cyan: '#06B6D4',
      },
    },
  },
  plugins: [],
};
