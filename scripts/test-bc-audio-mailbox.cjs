#!/usr/bin/env node
process.env.CRED_FILE = require('path').join(
  __dirname,
  '..',
  '..',
  'franks-standard-credentials',
  'email-bc-audio.env',
)
require('./test-mailbox.cjs')
