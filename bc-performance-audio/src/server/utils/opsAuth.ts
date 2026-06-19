import type { H3Event } from 'h3'
import { requireBcOpsAuth } from './bcOpsAuth'

/** Franks/TFS-compatible alias used by legacy ops routes. */
export function requireOpsAuth (event: H3Event): void {
  requireBcOpsAuth(event)
}
