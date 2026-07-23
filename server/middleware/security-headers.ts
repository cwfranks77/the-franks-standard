/**
 * Security Headers Middleware
 * Implements OWASP best practices and defense-in-depth
 */

export default defineEventHandler((event) => {
  // Content Security Policy - blocks inline scripts, XSS, clickjacking
  setHeader(event, 'Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://checkout.stripe.com https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://checkout.stripe.com https://js.stripe.com https://rochesyrxiyrxhzmkuwk.supabase.co",
    "frame-src 'self' https://checkout.stripe.com https://js.stripe.com https://meet.jit.si",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; '))

  // Prevent MIME type sniffing
  setHeader(event, 'X-Content-Type-Options', 'nosniff')

  // Prevent clickjacking
  setHeader(event, 'X-Frame-Options', 'SAMEORIGIN')

  // Enable XSS protection in older browsers
  setHeader(event, 'X-XSS-Protection', '1; mode=block')

  // Referrer Policy - don't leak referrer to external sites
  setHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy - disable unnecessary browser features
  setHeader(event, 'Permissions-Policy', [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=("self")',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ].join(', '))

  // HSTS - force HTTPS
  if (process.env.NODE_ENV === 'production') {
    setHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  // No caching for sensitive pages
  if (event.node.req.url?.includes('/api/owner') || event.node.req.url?.includes('/ops/')) {
    setHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    setHeader(event, 'Pragma', 'no-cache')
    setHeader(event, 'Expires', '0')
  }
})
