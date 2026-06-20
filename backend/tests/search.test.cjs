const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { pickTopic, buildChatResponse } = require('../ai_chat_agent/chat_router.js')

describe('search / chat routing', () => {
  it('picks payments topic', () => {
    const t = pickTopic('How do checkout fees work?')
    assert.equal(t.topic, 'payments')
  })

  it('picks COA topic', () => {
    const t = pickTopic('How do I verify a COA serial?')
    assert.equal(t.topic, 'coa')
  })

  it('returns FAQ reply without escalation for safe question', () => {
    const r = buildChatResponse('What is The Franks Standard?')
    assert.equal(r.escalated, false)
    assert.ok(r.reply.length > 10)
  })
})
