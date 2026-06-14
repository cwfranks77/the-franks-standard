#!/usr/bin/env bash
# Git Bash / WSL helper — runs the Node separation queue until empty.
set -euo pipefail
node scripts/run-separation-queue.cjs --all
