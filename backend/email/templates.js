/**
 * Transactional and marketing email templates.
 */

const SITE = () => (process.env.SITE_URL || process.env.NUXT_PUBLIC_SITE_URL || 'https://thefranksstandard.com').replace(/\/+$/, '')

const TEMPLATES = {
  order_confirmation: {
    category: 'transactional',
    subject: (d) => `Order confirmed — ${d.order_id || 'The Franks Standard'}`,
    html: (d) => `
      <p>Hi ${d.name || 'there'},</p>
      <p>Your order <strong>${d.order_id || ''}</strong> is confirmed.</p>
      <p>Total paid: <strong>${d.total || ''}</strong></p>
      <p><a href="${SITE()}/orders">View your orders</a></p>
    `,
  },
  dispute_update: {
    category: 'transactional',
    subject: (d) => `Dispute update — ${d.status || 'status changed'}`,
    html: (d) => `
      <p>Your dispute case has been updated.</p>
      <p>Status: <strong>${d.status || 'updated'}</strong></p>
      ${d.ruling ? `<p>Ruling: ${d.ruling}</p>` : ''}
      <p><a href="${SITE()}/disputes">View dispute</a></p>
    `,
  },
  fraud_case_update: {
    category: 'transactional',
    subject: () => 'Important account security notice',
    html: (d) => `
      <p>A fraud review case (${d.case_id || 'internal'}) has been updated.</p>
      <p>Status: <strong>${d.status || 'under review'}</strong></p>
      <p>If you believe this is an error, contact support through the platform.</p>
    `,
  },
  support_followup: {
    category: 'transactional',
    subject: () => 'How did we do? — Support follow-up',
    html: (d) => `
      <p>Your support case has been closed.</p>
      <p><a href="${d.survey_url || SITE()}">Rate your experience</a></p>
    `,
  },
  verification: {
    category: 'transactional',
    subject: () => 'Verify your email — The Franks Standard',
    html: (d) => `
      <p>Please verify your email address.</p>
      <p><a href="${d.verify_url || SITE()}">Verify now</a></p>
      ${d.code ? `<p>Or enter code: <strong>${d.code}</strong></p>` : ''}
    `,
  },
  marketing_manual: {
    category: 'marketing',
    subject: (d) => d.subject || 'News from The Franks Standard',
    html: (d) => `<div>${d.body || d.message || ''}</div>`,
  },
  plan_expiration_warning: {
    category: 'transactional',
    subject: () => 'Your seller plan is expiring soon',
    html: (d) => `
      <p>Your <strong>${d.plan_name || 'seller plan'}</strong> expires on ${d.expires_at || 'soon'}.</p>
      <p><a href="${SITE()}/sell/pricing">Renew or upgrade</a></p>
    `,
  },
}

function renderTemplate (key, data = {}) {
  const tpl = TEMPLATES[key]
  if (!tpl) return null
  return {
    template_key: key,
    category: tpl.category,
    subject: tpl.subject(data),
    html: tpl.html(data),
  }
}

function listTemplates () {
  return Object.keys(TEMPLATES)
}

module.exports = { renderTemplate, listTemplates, TEMPLATES, SITE }
