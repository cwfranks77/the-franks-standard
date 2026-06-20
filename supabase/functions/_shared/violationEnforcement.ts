import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import {
  actionForSeverity,
  scanContent,
  type ViolationSource,
} from './violationScanner.ts'
import {
  banDevice,
  banIp,
  banUser,
  freezeAccount,
  freezeMessaging72h,
} from './accountSafety.ts'
import { openFraudCase } from './fraudCaseEngine.ts'
import { logServerActivity } from './platformActivityLog.ts'

export type HandleViolationInput = {
  admin: SupabaseClient
  userId?: string | null
  sourceType: ViolationSource
  sourceId?: string | null
  content: string
  ipAddress?: string | null
  deviceFingerprint?: string | null
  browserFingerprint?: string | null
  metadata?: Record<string, unknown>
}

export async function scanAndEnforceViolation (input: HandleViolationInput) {
  const scan = scanContent(input.content, input.sourceType)
  if (scan.ok || !scan.maxSeverity) {
    return { violated: false as const, scan }
  }

  const action = actionForSeverity(scan.maxSeverity)
  const violationType = scan.matches[0]?.category || 'policy_violation'

  const { data: row, error } = await input.admin.from('violation_events').insert({
    user_id: input.userId ?? null,
    source_type: input.sourceType,
    source_id: input.sourceId ?? null,
    violation_type: violationType,
    severity: scan.maxSeverity,
    action_taken: action,
    content_excerpt: scan.excerpt,
    matches: scan.matches,
    ip_address: input.ipAddress ?? null,
    device_fingerprint: input.deviceFingerprint ?? null,
    browser_fingerprint: input.browserFingerprint ?? null,
    metadata: input.metadata ?? {},
  }).select('id').single()

  if (error) console.error('violation_events insert', error.message)

  let fraudCaseId: string | null = null

  if (input.userId) {
    if (action === 'messaging_frozen') {
      await freezeMessaging72h(input.admin, input.userId, `Policy violation: ${violationType}`)
    } else if (action === 'account_frozen') {
      await freezeAccount(input.admin, input.userId, `Policy violation: ${violationType}`)
    } else if (action === 'fraud_case_opened') {
      await freezeAccount(input.admin, input.userId, `Severe violation: ${violationType}`)
      const fraud = await openFraudCase(input.admin, {
        userId: input.userId,
        severity: 'critical',
        evidence: {
          violation_event_id: row?.id,
          matches: scan.matches,
          source_type: input.sourceType,
          source_id: input.sourceId,
        },
      })
      fraudCaseId = fraud.caseId

      if (scan.maxSeverity === 'severe') {
        await banUser(input.admin, input.userId, `Severe policy violation: ${violationType}`)
        if (input.deviceFingerprint) {
          await banDevice(input.admin, input.deviceFingerprint, violationType, input.userId)
        }
        if (input.ipAddress) {
          await banIp(input.admin, input.ipAddress, violationType, { fraudFlag: true, userId: input.userId })
        }
        await input.admin.from('violation_events').update({ action_taken: 'banned' }).eq('id', row?.id)
      }
    }

    await logServerActivity(input.admin, {
      userId: input.userId,
      eventType: 'policy_violation',
      actionCategory: 'safety',
      action: `Violation detected: ${violationType}`,
      metadata: {
        severity: scan.maxSeverity,
        action_taken: action,
        violation_event_id: row?.id,
        fraud_case_id: fraudCaseId,
      },
      ipAddress: input.ipAddress,
      deviceFingerprint: input.deviceFingerprint,
    })
  }

  return {
    violated: true as const,
    scan,
    action,
    violationEventId: row?.id ?? null,
    fraudCaseId,
  }
}

/** Scan without enforcement (preview / ops). */
export function previewScan (content: string, sourceType: ViolationSource = 'other') {
  return scanContent(content, sourceType)
}
