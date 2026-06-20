const STORAGE_KEY = 'tfs_device_fp_v1'

/** Stable browser fingerprint for activity logging (not for security). */
export function getDeviceFingerprint (): string {
  if (!import.meta.client) return 'server'
  try {
    let fp = localStorage.getItem(STORAGE_KEY)
    if (!fp) {
      fp = `fp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
      localStorage.setItem(STORAGE_KEY, fp)
    }
    return fp
  } catch {
    return 'unknown'
  }
}
