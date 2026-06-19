#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
TFS_DIR="$ROOT/the-franks-standard"
mkdir -p "$TFS_DIR"

echo "=== Creating The Franks Standard Marketing System ==="

# 1. Brand Kit
mkdir -p "$TFS_DIR/brand"
cat > "$TFS_DIR/brand/brand-kit.md" <<'EOF'
# The Franks Standard — Brand Kit

## Colors
- TFS Black — #0A0A0A
- TFS Gold — #C9A44A
- TFS White Marble — #F5F5F5
- TFS Deep Green — #0F3D2E
- TFS Steel Gray — #2E2E2E

## Typography
- Headings: Playfair Display
- Body: Inter
- Accent: Old English (for seals & certificates)

## Brand Voice
- Direct
- Confident
- Louisiana-authentic
- No fluff
- Built on trust & real-world experience
EOF

# 2. Marketing Site Structure
mkdir -p "$TFS_DIR/site"
cat > "$TFS_DIR/site/structure.md" <<'EOF'
# The Franks Standard — Marketing Site Structure

## Root Pages
- Home
- Marketplace
- BC Audio Division
- Collectibles
- Tools & Equipment
- Home & Outdoor
- Verified Used Gear
- Blog
- Contact
- Legal (Privacy, Terms, Affiliate Disclosure)

## BC Audio Sub-Site
- BC Audio Home
- Car Audio
- Home Audio
- DJ & Pro Audio
- Wiring & Accessories
- Best Deals Today
- Audio Blog
EOF

# 3. Homepage HTML
mkdir -p "$TFS_DIR/site/pages"
cat > "$TFS_DIR/site/pages/index.html" <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>The Franks Standard — Authenticity Meets Performance</title>
  <link rel="stylesheet" href="../styles/home.css" />
</head>

<body>
<header class="tfs-header">
  <div class="logo">THE FRANKS STANDARD</div>
  <nav>
    <a href="/">Home</a>
    <a href="/marketplace">Marketplace</a>
    <a href="/bc-audio">BC Audio</a>
    <a href="/collectibles">Collectibles</a>
    <a href="/blog">Blog</a>
    <a href="/contact">Contact</a>
  </nav>
</header>

<section class="hero">
  <h1>Authenticity Meets Performance</h1>
  <p>Verified products. Trusted sellers. A marketplace built on the Franks family standard.</p>
  <div class="cta-row">
    <a class="cta" href="/marketplace">Shop Marketplace</a>
    <a class="cta secondary" href="/bc-audio">Explore BC Audio</a>
  </div>
</section>

<section class="categories">
  <h2>Shop by Category</h2>
  <div class="grid">
    <a href="/collectibles" class="cat-card">Collectibles</a>
    <a href="/tools" class="cat-card">Tools & Equipment</a>
    <a href="/home-outdoor" class="cat-card">Home & Outdoor</a>
    <a href="/bc-audio" class="cat-card">BC Audio Division</a>
    <a href="/used" class="cat-card">Verified Used Gear</a>
  </div>
</section>

<section class="trust">
  <h2>The Franks Standard Promise</h2>
  <ul>
    <li>Verified authenticity on every item</li>
    <li>Real specs, real performance</li>
    <li>Owner oversight on every transaction</li>
    <li>Secure checkout & trusted partners</li>
  </ul>
</section>

<footer class="tfs-footer">
  <div class="footer-grid">
    <div>
      <h4>The Franks Standard</h4>
      <p>Where authenticity meets performance.</p>
    </div>
    <div>
      <h4>Explore</h4>
      <a href="/marketplace">Marketplace</a>
      <a href="/bc-audio">BC Audio</a>
      <a href="/collectibles">Collectibles</a>
    </div>
    <div>
      <h4>Legal</h4>
      <a href="/privacy">Privacy Policy</a>
      <a href="/terms">Terms of Service</a>
      <a href="/affiliate-disclosure">Affiliate Disclosure</a>
    </div>
  </div>
</footer>

</body>
</html>
EOF

# 4. CSS
mkdir -p "$TFS_DIR/site/styles"
cat > "$TFS_DIR/site/styles/home.css" <<'EOF'
body { margin:0; font-family:Inter, sans-serif; background:#F5F5F5; color:#0A0A0A; }
.tfs-header { display:flex; justify-content:space-between; padding:20px; background:#0A0A0A; color:white; }
.tfs-header nav a { margin-left:20px; color:white; text-decoration:none; }
.hero { padding:100px 20px; text-align:center; background:#C9A44A; color:#0A0A0A; }
.cta { padding:12px 24px; background:#0A0A0A; color:white; text-decoration:none; border-radius:4px; }
.cta.secondary { background:white; color:#0A0A0A; }
.categories .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:20px; padding:20px; }
.cat-card { background:white; padding:20px; border-radius:6px; text-align:center; text-decoration:none; color:#0A0A0A; }
.trust ul { list-style:none; padding:0; text-align:center; }
EOF

# 5. SEO
mkdir -p "$TFS_DIR/seo"
cat > "$TFS_DIR/seo/seo-pillars.md" <<'EOF'
# TFS SEO Pillars
- Authenticity
- Verified gear
- Louisiana marketplace
- Audio performance
- Collectibles verification
EOF

# 6. Email Sequences
mkdir -p "$TFS_DIR/emails"
cat > "$TFS_DIR/emails/welcome.txt" <<'EOF'
Subject: Welcome to The Franks Standard

Welcome to a marketplace built on trust, performance, and authenticity.
Explore collectibles, tools, and BC Audio’s verified gear.
EOF

# 7. Ad Campaigns
mkdir -p "$TFS_DIR/ads"
cat > "$TFS_DIR/ads/facebook.txt" <<'EOF'
Headline: Authentic Gear. Verified Sellers.
Text: The Franks Standard brings you collectibles, tools, and audio gear you can trust.
EOF

# 8. Affiliate Templates
mkdir -p "$TFS_DIR/affiliate"
cat > "$TFS_DIR/affiliate/product-card.html" <<'EOF'
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

echo "=== The Franks Standard Marketing System Generated Successfully ==="
