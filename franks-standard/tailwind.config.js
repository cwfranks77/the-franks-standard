/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app.vue',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './src/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#050509',
        surface: {
          DEFAULT: '#0B0F19',
          raised: '#111827',
        },
        primary: '#38BDF8',
        secondary: '#22C55E',
        muted: '#9CA3AF',
        border: '#1F2933',
      },
    },
  },
  plugins: [],
}
