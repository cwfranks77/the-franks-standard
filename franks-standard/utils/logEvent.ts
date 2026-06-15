export function logEvent(type: string, details: any) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] [${type}]`, details)
}
