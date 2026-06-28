/** Redirect guests to sign-in for seller checkout and account pages. */
export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser()
  if (!user.value) {
    return navigateTo('/auth/login')
  }
})
