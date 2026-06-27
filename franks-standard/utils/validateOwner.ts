export function validateOwner(event: any) {
  const key = event.node.req.headers['x-owner-key']
  const config = useRuntimeConfig()

  if (!key || key !== config.public.ownerKey) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
}
