export function generateCOA(product: { id: number; name: string }) {
  const id = Math.floor(Math.random() * 900000) + 100000

  return {
    id,
    productId: product.id,
    productName: product.name,
    issuedAt: new Date().toISOString(),
    chain: [
      {
        timestamp: new Date().toISOString(),
        description: 'COA issued by The Franks Standard'
      }
    ]
  }
}
