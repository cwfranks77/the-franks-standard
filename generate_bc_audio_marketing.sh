#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
BC_DIR="$ROOT/bc-audio"
mkdir -p "$BC_DIR"

echo "=== Creating BC Audio Brand & Marketing System ==="

# 1. Brand Kit
mkdir -p "$BC_DIR/brand"
cat > "$BC_DIR/brand/brand-kit.md" <<'EOF'
# BC Audio — Brand Kit

## Positioning
BC Audio is the audio division of The Franks Standard.
Built for real audio enthusiasts: car audio, home audio, DJ & pro audio.

## Colors
- BC Black — #050505
- BC Red — #D72638
- BC Dark Gray — #1F1F1F
- BC Light Gray — #F2F2F2
- Accent Green (Signal) — #1DB954

## Typography
- Headings: Oswald (strong, bold, technical)
- Body: Inter (clean, modern)
- Accent: Monospace for specs (RMS, ohms, etc.)

## Voice
- Technical but clear
- No fake specs, no hype
- Straight numbers, real performance
- Built for SPL competitors, installers, and serious listeners
EOF

# 2. Site Structure
mkdir -p "$BC_DIR/site"
cat > "$BC_DIR/site/structure.md" <<'EOF'
# BC Audio — Site Structure

## Root (under The Franks Standard)
- /bc-audio (BC Audio Home)
- /bc-audio/car-audio
- /bc-audio/home-audio
- /bc-audio/dj-pro
- /bc-audio/wiring-accessories
- /bc-audio/best-deals
- /bc-audio/blog

## Key Sections
- Featured Deals
- Top Categories
- Best Sellers
- Education (RMS vs Peak, wiring, tuning)
EOF

# 3. Landing Page HTML
mkdir -p "$BC_DIR/site/pages"
cat > "$BC_DIR/site/pages/index.html" <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BC Audio — Sound Built Better</title>
  <link rel="stylesheet" href="../styles/home.css" />
</head>

<body>

<header class="bc-header">
  <div class="logo">BC AUDIO</div>
  <nav>
    <a href="/bc-audio">Home</a>
    <a href="/bc-audio/car-audio">Car Audio</a>
    <a href="/bc-audio/home-audio">Home Audio</a>
    <a href="/bc-audio/dj-pro">DJ & Pro</a>
    <a href="/bc-audio/best-deals">Best Deals</a>
  </nav>
</header>

<section class="hero">
  <h1>Sound Built Better.</h1>
  <p>Verified subs, amps, and audio gear with real specs — no fake numbers, no fluff.</p>
  <div class="cta-row">
    <a class="cta" href="/bc-audio/best-deals">View Today's Best Deals</a>
    <a class="cta secondary" href="/bc-audio/car-audio">Browse Car Audio</a>
  </div>
</section>

<section class="categories">
  <h2>Shop BC Audio</h2>
  <div class="grid">
    <a href="/bc-audio/car-audio" class="cat-card">Car Audio</a>
    <a href="/bc-audio/home-audio" class="cat-card">Home Audio</a>
    <a href="/bc-audio/dj-pro" class="cat-card">DJ & Pro Audio</a>
    <a href="/bc-audio/wiring-accessories" class="cat-card">Wiring & Accessories</a>
    <a href="/bc-audio/best-deals" class="cat-card">Best Deals Today</a>
  </div>
</section>

<section class="trust">
  <h2>Why BC Audio</h2>
  <ul>
    <li>Real RMS ratings — no peak hype</li>
    <li>Verified specs and trusted partners</li>
    <li>Affiliate-powered until inventory lands</li>
    <li>Backed by The Franks Standard</li>
  </ul>
</section>

<section class="affiliate-grid">
  <h2>Featured Deals</h2>
  <!-- Drop product-card.html snippets here -->
</section>

<footer class="bc-footer">
  <p>BC Audio — A Division of The Franks Standard.</p>
</footer>

</body>
</html>
EOF

# 4. CSS
mkdir -p "$BC_DIR/site/styles"
cat > "$BC_DIR/site/styles/home.css" <<'EOF'
body { margin:0; font-family:Inter, sans-serif; background:#050505; color:#F2F2F2; }
a { color:inherit; }
.bc-header { display:flex; justify-content:space-between; padding:20px; background:#050505; border-bottom:1px solid #1F1F1F; }
.bc-header nav a { margin-left:20px; text-decoration:none; font-size:0.9rem; }
.logo { font-weight:700; letter-spacing:0.15em; }
.hero { padding:80px 20px; text-align:center; background:#1F1F1F; }
.hero h1 { font-size:2.5rem; margin-bottom:10px; }
.hero p { max-width:600px; margin:0 auto 20px; color:#CCCCCC; }
.cta-row { display:flex; justify-content:center; gap:12px; flex-wrap:wrap; }
.cta { padding:12px 24px; background:#D72638; color:white; text-decoration:none; border-radius:4px; font-weight:600; }
.cta.secondary { background:transparent; border:1px solid #D72638; }
.categories { padding:40px 20px; }
.categories h2 { text-align:center; margin-bottom:20px; }
.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px; }
.cat-card { background:#111111; padding:18px; border-radius:6px; text-align:center; text-decoration:none; border:1px solid #1F1F1F; }
.trust { padding:40px 20px; text-align:center; }
.trust ul { list-style:none; padding:0; max-width:500px; margin:0 auto; }
.trust li { margin:8px 0; color:#CCCCCC; }
.bc-footer { padding:20px; text-align:center; font-size:0.85rem; color:#777777; border-top:1px solid #1F1F1F; }
EOF

# 5. SEO
mkdir -p "$BC_DIR/seo"
cat > "$BC_DIR/seo/seo-pillars.md" <<'EOF'
# BC Audio — SEO Pillars

- car audio deals
- best subwoofers 2026
- best amplifiers 2026
- SPL competition gear
- home audio deals
- DJ & pro audio equipment
- verified audio marketplace
EOF

# 6. Email Sequences
mkdir -p "$BC_DIR/emails"
cat > "$BC_DIR/emails/welcome.txt" <<'EOF'
Subject: Welcome to BC Audio — Sound Built Better

Welcome to BC Audio, the audio division of The Franks Standard.
Here you'll find verified subs, amps, and audio gear with real specs and trusted partners.

Start with today's best deals:
[Link to /bc-audio/best-deals]
EOF

cat > "$BC_DIR/emails/deals.txt" <<'EOF'
Subject: Today's Best Audio Deals — Verified by BC Audio

We pulled the strongest deals from our partners — real RMS, real performance.
Click below to see today's featured subs, amps, and systems.

[Link to /bc-audio/best-deals]
EOF

# 7. Ad Campaigns
mkdir -p "$BC_DIR/ads"
cat > "$BC_DIR/ads/facebook.txt" <<'EOF'
Headline: Upgrade Your Sound — Verified Audio Gear
Text: Stop buying gear with fake specs. BC Audio brings you real RMS ratings, trusted partners, and serious performance.
CTA: Shop Deals
EOF

cat > "$BC_DIR/ads/google.txt" <<'EOF'
Headline 1: Best Car Audio Deals 2026
Headline 2: Verified Subs & Amps
Description: BC Audio — a division of The Franks Standard. Real specs, trusted partners, serious sound.
EOF

# 8. Affiliate Templates
mkdir -p "$BC_DIR/affiliate"
cat > "$BC_DIR/affiliate/product-card.html" <<'EOF'
<div class="product-card">
  <img src="PRODUCT_IMAGE_URL" alt="Product Image" />
  <h3>PRODUCT NAME</h3>
  <p class="specs">RMS: XXXW • Ohms: XΩ • Size: XX"</p>
  <div class="price-row">
    <span class="price">$PRICE</span>
    <span class="badge">Best Deal Today</span>
  </div>
  <a class="affiliate-btn" href="AFFILIATE_LINK" target="_blank">View Deal</a>
</div>
EOF

echo "=== BC Audio Brand & Marketing System Generated Successfully ==="
