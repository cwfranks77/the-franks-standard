/**
 * Create Meta (Facebook/Instagram) paid campaigns via Marketing API.
 * Default: DRY RUN or PAUSED ads — you opt in with META_ADS_LIVE=1 and META_ADS_STATUS=ACTIVE.
 *
 *   node scripts/run-meta-paid-ads.cjs [--campaign security|default|founders|honor] [--dry-run]
 *
 * Requires:
 *   META_AD_ACCOUNT_ID=act_123456789 (Ads Manager → Account settings)
 *   META_AD_ACCESS_TOKEN=... (user token with ads_management, business_management)
 *   FACEBOOK_PAGE_ID=...
 *   META_ADS_DAILY_BUDGET_USD=5  (max capped at 50)
 */
const axios = require('axios')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const { getCampaign, SITE } = require('../utils/adCampaignCopy.cjs')

const GRAPH = 'https://graph.facebook.com/v22.0'
const argv = process.argv.slice(2)
const dryRun = argv.includes('--dry-run') || process.env.META_ADS_DRY_RUN === '1' || process.env.META_ADS_LIVE !== '1'
function parseCampaignKey () {
  const eq = argv.find((a) => a.startsWith('--campaign='))
  if (eq) return eq.split('=')[1]
  const i = argv.indexOf('--campaign')
  if (i >= 0 && argv[i + 1]) return argv[i + 1]
  return process.env.META_ADS_CAMPAIGN || 'security'
}
const campaignKey = parseCampaignKey()

function adAccountPath () {
  const raw = String(process.env.META_AD_ACCOUNT_ID || '').trim()
  if (!raw) return null
  const id = raw.replace(/^act_/, '')
  return `${GRAPH}/act_${id}`
}

function accessToken () {
  return (
    process.env.META_AD_ACCESS_TOKEN
    || process.env.FACEBOOK_USER_ACCESS_TOKEN
    || process.env.FACEBOOK_PAGE_ACCESS_TOKEN
    || ''
  ).trim()
}

function dailyBudgetCents () {
  const usd = Math.min(50, Math.max(1, Number(process.env.META_ADS_DAILY_BUDGET_USD || 5)))
  return Math.round(usd * 100)
}

function adStatus () {
  if (dryRun) return 'DRY_RUN'
  const s = String(process.env.META_ADS_STATUS || 'PAUSED').toUpperCase()
  return s === 'ACTIVE' ? 'ACTIVE' : 'PAUSED'
}

async function graphPost (url, params) {
  const token = accessToken()
  const res = await axios.post(url, null, {
    params: { ...params, access_token: token },
  })
  return res.data
}

async function createMetaPaidCampaign () {
  const act = adAccountPath()
  const token = accessToken()
  const pageId = process.env.FACEBOOK_PAGE_ID
  const camp = getCampaign(campaignKey)
  const paid = camp.metaPaid || getCampaign('default').metaPaid

  if (!act || !token || !pageId) {
    if (dryRun) {
      console.warn('[DRY RUN] Missing ad account/token/page — showing plan only. Add secrets for live create.')
      console.log(JSON.stringify({
        campaignKey,
        needs: ['META_AD_ACCOUNT_ID', 'META_AD_ACCESS_TOKEN', 'FACEBOOK_PAGE_ID'],
        paid,
      }, null, 2))
      return true
    }
    console.error('Missing META_AD_ACCOUNT_ID, META_AD_ACCESS_TOKEN (or Facebook tokens), or FACEBOOK_PAGE_ID')
    console.error('See docs/ADS-AUTOMATION-SETUP.md')
    return false
  }

  const plan = {
    campaign: {
      name: paid.name,
      objective: 'OUTCOME_TRAFFIC',
      status: adStatus(),
      special_ad_categories: '[]',
    },
    adset: {
      name: `${paid.name} — US`,
      daily_budget: dailyBudgetCents(),
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'LINK_CLICKS',
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      targeting: JSON.stringify({
        geo_locations: { countries: ['US'] },
        age_min: 18,
        age_max: 65,
      }),
      status: adStatus(),
    },
    creative: {
      name: `${paid.name} — creative`,
      object_story_spec: JSON.stringify({
        page_id: pageId,
        link_data: {
          message: paid.message,
          link: paid.link,
          name: paid.headline,
          picture: `${SITE}/franks-pavilion.png`,
          call_to_action: { type: paid.cta || 'LEARN_MORE' },
        },
      }),
    },
  }

  if (dryRun) {
    console.log('[DRY RUN] Meta paid ads plan (set META_ADS_LIVE=1 to create):')
    console.log(JSON.stringify(plan, null, 2))
    console.log(`Daily budget: $${(plan.adset.daily_budget / 100).toFixed(2)} · Status: ${adStatus()}`)
    return true
  }

  const campaign = await graphPost(`${act}/campaigns`, {
    name: plan.campaign.name,
    objective: plan.campaign.objective,
    status: plan.campaign.status,
    special_ad_categories: plan.campaign.special_ad_categories,
  })
  const campaignId = campaign.id
  console.log('Campaign:', campaignId)

  const adset = await graphPost(`${act}/adsets`, {
    name: plan.adset.name,
    campaign_id: campaignId,
    daily_budget: plan.adset.daily_budget,
    billing_event: plan.adset.billing_event,
    optimization_goal: plan.adset.optimization_goal,
    bid_strategy: plan.adset.bid_strategy,
    targeting: plan.adset.targeting,
    status: plan.adset.status,
  })
  const adsetId = adset.id
  console.log('Ad set:', adsetId)

  const creative = await graphPost(`${act}/adcreatives`, {
    name: plan.creative.name,
    object_story_spec: plan.creative.object_story_spec,
  })
  const creativeId = creative.id
  console.log('Creative:', creativeId)

  const ad = await graphPost(`${act}/ads`, {
    name: `${paid.name} — ad`,
    adset_id: adsetId,
    creative: JSON.stringify({ creative_id: creativeId }),
    status: adStatus(),
  })
  console.log('Ad:', ad.id)
  console.log(`OK: Meta paid campaign "${paid.name}" (${adStatus()}) — enable in Ads Manager if PAUSED`)
  return true
}

;(async () => {
  try {
    const ok = await createMetaPaidCampaign()
    process.exit(ok ? 0 : 1)
  } catch (e) {
    const msg = e.response?.data?.error || e.message
    console.error('Meta paid ads failed:', JSON.stringify(msg, null, 2))
    console.error('Tip: Token needs ads_management. Create ads in Business Manager first.')
    process.exit(1)
  }
})()
