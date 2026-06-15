import coas from '@/server/data/coa.json'

export default defineEventHandler((event) => {
  const { id } = getQuery(event)
  return coas.find((c) => String(c.id) === String(id)) || null
})
