import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { isBanned } from './accountSafety.ts'

/** Heuristic datacenter/VPN detection — no paid API calls. */
const DATACENTER_IP_PREFIXES = [
  '23.', '34.', '35.', '44.', '52.', '54.', '104.', '141.', '142.', '143.',
  '149.', '157.', '158.', '159.', '161.', '162.', '163.', '164.', '165.',
  '167.', '168.', '172.16.', '172.17.', '172.18.', '172.19.', '172.2',
  '172.3', '10.', '192.168.',
]

const VPN_HEADERS = ['via', 'x-vpn', 'x-proxy', 'proxy-connection']

export type VpnCheckResult = {
  suspicious: boolean
  reasons: string[]
  requiresPhoneVerification: boolean
}

export function assessIpRisk (ipAddress: string, req?: Request): VpnCheckResult {
  const ip = String(ipAddress || '').trim()
  const reasons: string[] = []

  if (!ip || ip === 'unknown') {
    return { suspicious: false, reasons: [], requiresPhoneVerification: false }
  }

  for (const prefix of DATACENTER_IP_PREFIXES) {
    if (ip.startsWith(prefix)) {
      reasons.push('datacenter_ip_range')
      break
    }
  }

  if (req) {
    for (const h of VPN_HEADERS) {
      if (req.headers.get(h)) reasons.push(`header_${h}`)
    }
    const cfBot = req.headers.get('cf-bot-score')
    if (cfBot && Number(cfBot) < 30) reasons.push('low_bot_score')
  }

  const suspicious = reasons.length > 0
  return {
    suspicious,
    reasons,
    requiresPhoneVerification: suspicious,
  }
}

export async function applyVpnPolicy (
  admin: SupabaseClient,
  params: {
    userId?: string | null
    ipAddress: string
    req?: Request
  },
): Promise<VpnCheckResult & { blocked: boolean }> {
  const assessment = assessIpRisk(params.ipAddress, params.req)

  if (params.userId) {
    const ban = await isBanned(admin, { userId: params.userId, ipAddress: params.ipAddress })
    if (ban.banned) {
      return { ...assessment, blocked: true, requiresPhoneVerification: true }
    }

    if (assessment.requiresPhoneVerification) {
      await admin.from('profiles').update({
        requires_phone_verification: true,
        last_known_ip: params.ipAddress,
      }).eq('id', params.userId)
    } else {
      await admin.from('profiles').update({ last_known_ip: params.ipAddress }).eq('id', params.userId)
    }
  }

  return { ...assessment, blocked: false }
}
