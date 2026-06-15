import { validateOwner } from '@/server/utils/validateOwner'
import coas from '@/server/data/coa.json'
import products from '@/server/data/products.json'
import { logEvent } from '@/server/utils/logger'

export default defineEventHandler(async (event) => {
  validateOwner(event)

  const body = await readBody(event)
  const { productId } = body

  const product = products.find((p) => p.id === productId)
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  const newId = Math.floor(Math.random() * 900000) + 100000

  const newCOA = {
    id: newId,
    productId,
    productName: product.name,
    issuedAt: new Date().toISOString(),
    chain: [
      {
        timestamp: new Date().toISOString(),
        description: 'COA issued by The Franks Standard'
      }
    ]
  }

  coas.push(newCOA)

  logEvent('COA_ISSUED', { productId, coaId: newId })

  return newCOA
})
