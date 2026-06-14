import sgMail from '@sendgrid/mail'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { customerEmail, productName, retailPrice, shippingAddress, productSku } = body ?? {}
  try {
    if (!customerEmail || !productName || !retailPrice) {
      throw createError({ statusCode: 400, statusMessage: 'Missing email dispatch parameters.' })
    }

    const clientReceiptHtml = `<div style="background-color:#0a0a0a; color:#e5e5e5; font-family:sans-serif; padding:20px; border-radius:10px;"><h2 style="color:#06b6d4;">B&C Performance Audio - Confirmation</h2><p>Order processing immediately.</p><hr style="border-color:#262626;" /><p><strong>Item:</strong> ${productName}</p><p><strong>Charged:</strong> $${retailPrice}</p></div>`
    const warehousePullHtml = `<div style="background-color:#ffffff; color:#000000; font-family:sans-serif; padding:20px; border:2px solid #000;"><h2>LOGISTICS PULL SHEET</h2><p><strong>SKU:</strong> ${productSku || 'UNKNOWN'}</p><p><strong>Address:</strong> ${shippingAddress || 'PENDING'}</p></div>`

    const apiKey = (process.env.SENDGRID_API_KEY || '').trim()
    const fromEmail = (process.env.SENDGRID_FROM_EMAIL || 'info@thefranksstandard.com').trim()
    const fromName = (process.env.SENDGRID_FROM_NAME || 'B&C Performance Audio').trim()
    const warehouseEmail = (process.env.WAREHOUSE_DISPATCH_EMAIL || fromEmail).trim()

    const dispatch = { customerReceipt: 'skipped', warehousePull: 'skipped' as string }

    if (apiKey) {
      sgMail.setApiKey(apiKey)
      const from = { email: fromEmail, name: fromName }

      try {
        await sgMail.send({
          to: customerEmail,
          from,
          subject: 'B&C Performance Audio — Order Confirmation',
          html: clientReceiptHtml,
        })
        dispatch.customerReceipt = 'sent'
      } catch (e: any) {
        dispatch.customerReceipt = `failed: ${e?.response?.body?.errors?.[0]?.message || e?.message || 'unknown'}`
        console.error('[EMAIL ENGINE] customer receipt failed:', dispatch.customerReceipt)
      }

      try {
        await sgMail.send({
          to: warehouseEmail,
          from,
          subject: `Logistics Pull Sheet — ${productSku || 'UNKNOWN'}`,
          html: warehousePullHtml,
        })
        dispatch.warehousePull = 'sent'
      } catch (e: any) {
        dispatch.warehousePull = `failed: ${e?.response?.body?.errors?.[0]?.message || e?.message || 'unknown'}`
        console.error('[EMAIL ENGINE] warehouse pull failed:', dispatch.warehousePull)
      }
    } else {
      // No key configured — fall back to console logs so dev still works.
      console.log(`[EMAIL ENGINE]: (no SENDGRID_API_KEY) Invoice built for ${customerEmail}`)
      console.log(`[EMAIL ENGINE]: (no SENDGRID_API_KEY) Warehouse pull sheet ready for ${warehouseEmail}`)
    }

    return {
      success: true,
      message: apiKey ? 'Receipt streams dispatched via SendGrid.' : 'SendGrid key missing — logged to console only.',
      dispatch,
      auditTrail: { receiptTarget: customerEmail, warehouseTarget: warehouseEmail, warehouseActionSku: productSku },
    }
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || error?.message || 'Email dispatch failure',
    })
  }
})
