import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'owner-cursor': '#FF7A00',
        'bg-editor': '#1E1E1E',
        'bg-surface': '#252526',
        'bg-sidebar': '#333333',
      },
    },
  },
  plugins: [],
} satisfies Config;
