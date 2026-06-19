import Stripe from "stripe";

const SITE_URL = (process.env.NUXT_PUBLIC_SITE_URL || "https://www.bcpoweraudio.com").replace(/\/$/, "");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = String(process.env.STRIPE_SECRET_KEY || "").trim();
  if (!secretKey) {
    return res.status(503).json({ error: "Stripe is not configured" });
  }

  const stripe = new Stripe(secretKey);

  try {
    const { cart } = req.body || {};

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const line_items = cart.map((item) => {
      const price = Number(item.price);
      const name = String(item.name || "BC Audio item").trim();

      if (!name || !Number.isFinite(price) || price <= 0) {
        throw new Error("Invalid cart item");
      }

      return {
        price_data: {
          currency: "usd",
          product_data: { name },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${SITE_URL}/bc-audio/success`,
      cancel_url: `${SITE_URL}/bc-audio/cancel`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Stripe checkout failed" });
  }
}
