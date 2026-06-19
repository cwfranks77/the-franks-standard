#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
SITE="$ROOT/bc-audio/site"

sed_inplace() {
  if sed --version 2>/dev/null | grep -q GNU; then
    sed -i "$@"
  else
    sed -i '' "$@"
  fi
}

echo "=== STARTING FULL BC AUDIO FIX ==="

###############################################
# 1. CART ICON FIRST IN NAV (LEFT OF MENU LINKS)
###############################################
while IFS= read -r FILE; do
  [ -f "$FILE" ] || continue
  if grep -q 'class="cart-icon"' "$FILE"; then
    # Move cart link to immediately after <nav> if it was at the end
    if ! grep -q '<nav>.*cart-icon' "$FILE" && grep -q '<nav>' "$FILE"; then
      sed_inplace '/<a href="\/bc-audio\/cart" class="cart-icon">/d' "$FILE"
      sed_inplace 's|<nav>|<nav>\n    <a href="/bc-audio/cart" class="cart-icon" aria-label="View cart">🛒 Cart</a>|' "$FILE"
      echo "Moved cart icon to left of menu in: $FILE"
    fi
  else
    sed_inplace 's|<nav>|<nav>\n    <a href="/bc-audio/cart" class="cart-icon" aria-label="View cart">🛒 Cart</a>|' "$FILE"
    echo "Injected cart icon into: $FILE"
  fi
done < <(find "$SITE/pages" -type f -name '*.html' 2>/dev/null)

###############################################
# 2. GO-TO-CART LOGIC IN add_to_cart.js
###############################################
mkdir -p "$SITE/scripts"

cat > "$SITE/scripts/add_to_cart.js" <<'EOF'
function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));

  const goBtn = document.getElementById("go-to-cart-btn");
  if (goBtn) goBtn.style.display = "inline-block";

  if (typeof flashGoToCart === "function") {
    flashGoToCart();
    return;
  }

  window.location.href = "/bc-audio/cart";
}

function flashGoToCart() {
  const goBtn = document.getElementById("go-to-cart-btn");
  if (goBtn) goBtn.style.display = "inline-block";
}
EOF

###############################################
# 3. PRODUCT CARD: ADD TO CART + GO TO CART
###############################################
cat > "$ROOT/bc-audio/affiliate/product-card.html" <<'EOF'
<div class="product-card">
  <img src="PRODUCT_IMAGE_URL" alt="Product Image" />
  <h3>PRODUCT NAME</h3>
  <p class="specs">RMS: XXXW • Ohms: XΩ • Size: XX"</p>
  <div class="price-row">
    <span class="price">$PRICE</span>
    <span class="badge">Best Deal Today</span>
  </div>
  <button type="button" class="affiliate-btn" onclick='addToCart({ name: "PRODUCT NAME", price: PRICE_NUM })'>Add to Cart</button>
  <a class="affiliate-btn affiliate-btn--secondary" href="AFFILIATE_LINK" target="_blank">View Deal</a>
  <button id="go-to-cart-btn" type="button" onclick="window.location.href='/bc-audio/cart'"
    style="display:none;margin-top:10px;padding:10px 20px;background:#D72638;color:white;border:none;border-radius:4px;font-weight:bold;cursor:pointer;width:100%;">
    Go To Cart
  </button>
</div>
<script src="../site/scripts/add_to_cart.js"></script>
EOF

###############################################
# 4. SKIP GLOBAL PETRA REPLACE (breaks catalog feeds)
###############################################
echo "Skipped global Petra replace — wholesaler catalog files must keep Petra names."

###############################################
# 5. OFFICIAL PHONE GREETING
###############################################
mkdir -p "$ROOT/bc-audio/voice"

cat > "$ROOT/bc-audio/voice/customer_service_greeting.txt" <<'EOF'
Thank you for calling B&C Performance Audio, a division of The Franks Standard.
Your call is important to us. Please hold while we connect you to customer support.
EOF

###############################################
# 6. NAV CSS — CART LEFT, NO OVERLAP
###############################################
if ! grep -q "cart-icon" "$SITE/styles/home.css" 2>/dev/null; then
  cat >> "$SITE/styles/home.css" <<'EOF'

.bc-header nav { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 16px; }
.cart-icon {
  order: -1;
  margin-right: 8px;
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid #D72638;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}
.cart-icon:hover { background: rgba(215, 38, 56, 0.15); }
EOF
  echo "Added cart-icon styles to home.css"
fi

echo "=== BC AUDIO FIX COMPLETE ==="
echo "Cart icon left of menu, Go-To-Cart enabled, greeting saved."
echo "Live site (Nuxt): cart is in bc-performance-audio — rebuild to publish."
