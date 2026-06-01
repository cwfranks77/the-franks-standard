#!/usr/bin/env node
const https = require('https')
https.get('https://thefranksstandard.com/_nuxt/BGOLaQJL.js', (res) => {
  let d = ''
  res.on('data', (c) => { d += c })
  res.on('end', () => {
    const terms = [
      'record_seller_policy_acceptance',
      'accept-seller-policies',
      'seller_policies_version',
      'seller_policies_accepted_at',
      'recordAcceptanceOnProfile',
    ]
    for (const t of terms) console.log(t, d.includes(t))
    const rpc = [...d.matchAll(/record_seller_policy/g)]
    console.log('record_seller_policy partial matches', rpc.length)
  })
})
