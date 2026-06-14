import { calculateLouisianaTax } from '../../utils/tax'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { productId, retailPrice, wholesaleCost, distributorId, customerZip } = body ?? {}
  try {
    if (!productId || typeof retailPrice !== 'number' || typeof wholesaleCost !== 'number') {
      throw createError({ statusCode: 400, statusMessage: 'Missing or invalid variables.' })
    }

    // Louisiana state + parish sales tax applied to the customer's card charge.
    const zip = String(customerZip || '').trim()
    const { taxAmount, totalCombinedRatePercentage } = calculateLouisianaTax(zip, retailPrice)
    const customerTotal = Math.round((retailPrice + taxAmount) * 100) / 100

    // Stripe processing fee is charged on the full collected amount (retail + tax).
    const stripeProcessingFee = customerTotal * 0.029 + 0.30
    const platformNetProfit = retailPrice - wholesaleCost - stripeProcessingFee

    return {
      success: true,
      payload: {
        subtotal: Math.round(retailPrice * 100),
        taxAmount: Math.round(taxAmount * 100),
        taxRatePercentage: totalCombinedRatePercentage,
        amountToChargeCustomer: Math.round(customerTotal * 100),
        applicationFeeAmount: Math.round(platformNetProfit * 100),
        transferToDistributor: Math.round(wholesaleCost * 100),
        currency: 'usd',
        metadata: {
          targetProductId: productId,
          supplierIdentifier: distributorId || 'direct_brand',
          purchaserZip: zip || 'unknown',
        },
      },
    }
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || error?.message || 'Internal Server Settlement Failure',
    })
  }
})
