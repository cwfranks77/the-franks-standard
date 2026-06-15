import products from '@/server/data/products.json'

export default defineEventHandler((event) => {
  const { id } = getQuery(event)
  return products.find((p) => String(p.id) === String(id)) || null
})
