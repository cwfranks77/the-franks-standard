import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

export type ComplianceProfile = {
  contact_phone: string | null
  contact_email: string | null
  terms_accepted: boolean | null
  monitoring_consent: boolean | null
}

const CONTACT_MESSAGE = 'Contact information required.'

export async function loadComplianceProfile (
  admin: SupabaseClient,
  userId: string,
): Promise<ComplianceProfile | null> {
  const { data } = await admin
    .from('profiles')
    .select('contact_phone, contact_email, terms_accepted, monitoring_consent')
    .eq('id', userId)
    .maybeSingle()
  return data as ComplianceProfile | null
}

async function resolveEmail (
  admin: SupabaseClient,
  userId: string,
  profile: ComplianceProfile | null,
): Promise<string | null> {
  const fromProfile = String(profile?.contact_email ?? '').trim()
  if (fromProfile) return fromProfile
  const { data } = await admin.auth.admin.getUserById(userId)
  return String(data?.user?.email ?? '').trim() || null
}

export async function assertContactInfoComplete (
  admin: SupabaseClient,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string; message: string }> {
  const profile = await loadComplianceProfile(admin, userId)
  const phone = String(profile?.contact_phone ?? '').trim()
  const email = await resolveEmail(admin, userId, profile)
  if (!phone || !email) {
    return { ok: false, error: 'contact_info_required', message: CONTACT_MESSAGE }
  }
  return { ok: true }
}

export async function assertTermsAccepted (
  admin: SupabaseClient,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string; message: string }> {
  const profile = await loadComplianceProfile(admin, userId)
  if (profile?.terms_accepted !== true) {
    return {
      ok: false,
      error: 'terms_not_accepted',
      message: 'Terms and conditions must be accepted before using the marketplace.',
    }
  }
  return { ok: true }
}

export async function assertMonitoringConsent (
  admin: SupabaseClient,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string; message: string }> {
  const profile = await loadComplianceProfile(admin, userId)
  if (profile?.monitoring_consent !== true) {
    return {
      ok: false,
      error: 'monitoring_consent_required',
      message: 'Monitoring consent is required before using the marketplace.',
    }
  }
  return { ok: true }
}

/** Contact + terms + monitoring — required for listing, messaging, purchasing, disputes. */
export async function assertMarketplaceCompliance (
  admin: SupabaseClient,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string; message: string }> {
  const contact = await assertContactInfoComplete(admin, userId)
  if (!contact.ok) return contact
  const terms = await assertTermsAccepted(admin, userId)
  if (!terms.ok) return terms
  const monitoring = await assertMonitoringConsent(admin, userId)
  if (!monitoring.ok) return monitoring
  return { ok: true }
}
