// nuxt.config.ts
export default defineNuxtConfig({
  css: ['@/assets/css/tailwind.css'],
  modules: [],
  app: {
    head: {
      title: 'The Franks Standard',
      meta: [
        {
          name: 'description',
          content: 'Certified, documented, no-bullshit audio & performance gear.'
        }
      ]
    }
  },
  runtimeConfig: {
    public: {
      ownerKey: ''
    }
  }
})
