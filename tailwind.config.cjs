// tailwind.config.cjs — root monorepo build (Franks + B&C)
module.exports = {
  content: [
    './app.vue',
    './layouts/**/*.vue',
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './franks-standard/components/**/*.{vue,js,ts}',
    './franks-standard/src/**/*.{vue,js,ts}',
    './franks-standard/pages/**/*.{vue,js,ts}',
    './bc-performance-audio/src/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#050509',
        surface: '#0B0F19',
        surface2: '#111827',
        primary: '#FFB300',
        gold: '#FFB300',
        goldLight: '#FFCE5D',
        secondary: '#22C55E',
        danger: '#EF4444',
        textMain: '#F9FAFB',
        textMuted: '#9CA3AF',
        border: '#1F2933',
      },
    },
  },
  plugins: [],
}
