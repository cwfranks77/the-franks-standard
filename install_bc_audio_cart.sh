#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
BC_DIR="$ROOT/bc-audio/site"

echo "=== Installing BC Audio Cart System ==="

# Ensure directories exist
mkdir -p "$BC_DIR/pages"
mkdir -p "$BC_DIR/scripts"

###############################################
# 1. CREATE CART PAGE
###############################################
cat > "$BC_DIR/pages/cart.html" <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Cart — BC Audio</title>
  <link rel="stylesheet" href="../styles/home.css" />
  <script src="../scripts/cart.js" defer></script>
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
    <a href="/bc-audio/cart" class="cart-icon">Cart</a>
  </nav>
</header>

<section class="cart">
  <h1>Your Cart</h1>
  <div id="cart-items"></div>
  <button class="checkout-btn">Proceed to Checkout</button>
</section>

</body>
</html>
EOF

###############################################
# 2. CREATE CART SCRIPT
###############################################
cat > "$BC_DIR/scripts/cart.js" <<'EOF'
const cartContainer = document.getElementById("cart-items");
const cart = JSON.parse(localStorage.getItem("cart") || "[]");

function renderCart() {
  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  cartContainer.innerHTML = cart
    .map(
      item => `
      <div class="cart-item">
        <h3>${item.name}</h3>
        <p>Price: $${item.price}</p>
      </div>
    `
    )
    .join("");
}

renderCart();
EOF

###############################################
# 3. PATCH HEADER TO ADD CART LINK
###############################################
HEADER_FILE="$BC_DIR/pages/index.html"

if ! grep -q "Cart</a>" "$HEADER_FILE"; then
  if sed --version 2>/dev/null | grep -q GNU; then
    sed -i 's|</nav>|    <a href="/bc-audio/cart" class="cart-icon">Cart</a>\n  </nav>|' "$HEADER_FILE"
  else
    sed -i '' 's|</nav>|    <a href="/bc-audio/cart" class="cart-icon">Cart</a>\n  </nav>|' "$HEADER_FILE"
  fi
fi

###############################################
# 4. CREATE ADD-TO-CART LOGIC SNIPPET
###############################################
cat > "$BC_DIR/scripts/add_to_cart.js" <<'EOF'
function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
  window.location.href = "/bc-audio/cart";
}
EOF

echo "=== BC Audio Cart System Installed Successfully ==="
