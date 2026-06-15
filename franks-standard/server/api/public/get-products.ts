import products from '@/server/data/products.json'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  let result = products

  if (query.featured === 'true') {
    result = result.filter((p) => p.featured === true)
  }

  if (query.q) {
    const q = String(query.q).toLowerCase()
    result = result.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    )
  }

  if (query.category) {
    result = result.filter((p) => p.category === query.category)
  }

  return result
})
