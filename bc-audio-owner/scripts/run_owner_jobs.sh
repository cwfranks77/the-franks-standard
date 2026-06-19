#!/usr/bin/env bash
set -euo pipefail
node -e "require('../bc-audio-owner/src/jobs/backupDb').backupDb().catch(e=>console.error(e)); require('../bc-audio-owner/src/jobs/cleanupActivity').cleanupActivity(90).catch(e=>console.error(e));"
