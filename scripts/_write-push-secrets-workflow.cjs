const fs = require('fs')
const path = '.github/workflows/push-supabase-stripe-secrets.yml'
const content = `name: Push Stripe secrets to Supabase

on:
  workflow_dispatch:

jobs:
  push:
    runs-on: ubuntu-latest
    steps:
      - name: Set Supabase Edge secrets
        env:
          SUPABASE_ACCESS_TOKEN: \${{ secrets.SUPABASE_ACCESS_TOKEN }}
          STRIPE_SECRET_KEY: \${{ secrets.STRIPE_SECRET_KEY }}
          STRIPE_WEBHOOK_SECRET: \${{ secrets.STRIPE_WEBHOOK_SECRET }}
        run: |
          npx supabase@latest secrets set \\
            STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \\
            SITE_URL=https://thefranksstandard.com \\
            STRIPE_PLATFORM_FEE_BPS=500 \\
            STRIPE_TAX_ENABLED=true \\
            --project-ref rochesyrxiyrxhzmkuwk
          if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
            npx supabase@latest secrets set \\
              STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET" \\
              --project-ref rochesyrxiyrxhzmkuwk
          fi
          echo "Supabase Edge secrets updated."
`
fs.writeFileSync(path, content, 'utf8')
console.log('written', path, fs.readFileSync(path)[0], fs.readFileSync(path)[1])
