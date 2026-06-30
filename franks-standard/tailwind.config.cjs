// tailwind.config.cjs
module.exports = {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        bg: '#050509',
        surface: '#0B0F19',
        surface2: '#111827',
        primary: '#38BDF8',
        secondary: '#22C55E',
        danger: '#EF4444',
        textMain: '#F9FAFB',
        textMuted: '#9CA3AF',
        border: '#1F2933'
      }
    }
  },
  plugins: []
}
