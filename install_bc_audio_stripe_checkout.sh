#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
BC_DIR="$ROOT/bc-audio/site"

echo "=== Installing Stripe Hosted Checkout for BC Audio ==="

sed_inplace() {
  if sed --version 2>/dev/null | grep -q GNU; then
    sed -i "$@"
  else
    sed -i '' "$@"
  fi
}

###############################################
# 1. CREATE .env ENTRIES (SAFE, EMPTY)
###############################################
if ! grep -q "STRIPE_SECRET_KEY" "$ROOT/.env" 2>/dev/null; then
  echo "" >> "$ROOT/.env"
  echo "STRIPE_SECRET_KEY=" >> "$ROOT/.env"
  echo "STRIPE_PUBLIC_KEY=" >> "$ROOT/.env"
  echo "Added STRIPE_SECRET_KEY and STRIPE_PUBLIC_KEY to .env"
fi

###############################################
# 2. CREATE BACKEND CHECKOUT ROUTE
###############################################
mkdir -p "$ROOT/api"

cat > "$ROOT/api/checkout.js" <<'EOF'
import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { cart } = req.body;

    const line_items = cart.map(item => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: 1
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: "https://yourdomain.com/bc-audio/success",
      cancel_url: "https://yourdomain.com/bc-audio/cancel"
    });

    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Stripe checkout failed" });
  }
}
EOF

###############################################
# 3. CREATE SUCCESS + CANCEL PAGES
###############################################
mkdir -p "$BC_DIR/pages"

cat > "$BC_DIR/pages/success.html" <<'EOF'
<!DOCTYPE html>
<html>
<head><title>Order Complete</title></head>
<body>
  <h1>Thank you for your purchase!</h1>
  <p>Your order has been successfully processed.</p>
  <a href="/bc-audio">Return to BC Audio</a>
</body>
</html>
EOF

cat > "$BC_DIR/pages/cancel.html" <<'EOF'
<!DOCTYPE html>
<html>
<head><title>Checkout Canceled</title></head>
<body>
  <h1>Checkout Canceled</h1>
  <p>Your payment was not completed.</p>
  <a href="/bc-audio/cart">Return to Cart</a>
</body>
</html>
EOF

###############################################
# 4. UPDATE CART PAGE CHECKOUT BUTTON
###############################################
CART_PAGE="$BC_DIR/pages/cart.html"

if grep -q "checkout-btn" "$CART_PAGE"; then
  sed_inplace 's|<button class="checkout-btn">Proceed to Checkout</button>|<button class="checkout-btn" onclick="startCheckout()">Proceed to Checkout</button>|' "$CART_PAGE"
fi

###############################################
# 5. CREATE CHECKOUT SCRIPT
###############################################
cat > "$BC_DIR/scripts/checkout.js" <<'EOF'
async function startCheckout() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart })
  });

  const data = await response.json();

  if (data.url) {
    window.location.href = data.url;
  } else {
    alert("Checkout failed. Please try again.");
  }
}
EOF

###############################################
# 6. ENSURE CART PAGE LOADS CHECKOUT SCRIPT
###############################################
if ! grep -q "checkout.js" "$CART_PAGE"; then
  sed_inplace 's|</body>|  <script src="../scripts/checkout.js"></script>\n</body>|' "$CART_PAGE"
fi

echo "=== Stripe Hosted Checkout Installed Successfully ==="
echo "IMPORTANT: Add your Stripe keys to .env before testing."
