const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { routeIntent, checkEscalation } = require('../ai_phone_agent/router.js')
const { checkEscalation: chatEscalation } = require('../ai_chat_agent/chat_router.js')
const { escalate } = require('../owner/manual_fraud_review.js')
const { mockAdmin } = require('./_helpers.cjs')

describe('fraud triggers', () => {
  it('routes fraud intent on phone agent', () => {
    assert.equal(routeIntent('I want to report a scam seller'), 'fraud')
  })

  it('escalates threats on phone agent', () => {
    const r = checkEscalation('I will hurt you if no refund')
    assert.equal(r.escalate, true)
    assert.equal(r.reason, 'threat')
  })

  it('escalates law enforcement in chat', () => {
    const r = chatEscalation('I need to speak with law enforcement about a subpoena')
    assert.equal(r.escalate, true)
    assert.equal(r.reason, 'law_enforcement')
  })

  it('escalates fraud case severity', async () => {
    const base = mockAdmin()
    const admin = {
      ...base,
      from: (table) => {
        if (table === 'audit_logs') return base.from(table)
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { evidence: {} } }),
            }),
          }),
          update: () => ({
            eq: async () => ({ error: null }),
          }),
        }
      },
    }
    const r = await escalate(admin, 'case-1')
    assert.equal(r.ok, true)
  })
})
