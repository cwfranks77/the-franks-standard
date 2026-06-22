export default defineEventHandler((event) => {
  return sendRedirect(event, '/tfs/owner/index.html', 302)
})
