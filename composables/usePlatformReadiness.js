/** Platform readiness — fees vs full marketplace checkout. */
export function usePlatformReadiness () {
  const config = useRuntimeConfig()
  const { allConfigured, configuredCount, links } = usePaymentLinks()

  const supabaseUrl = computed(() => {
    const sb = config.public.supabase
    return String(sb?.url || config.public.supabaseUrl || "").trim()
  })
  const supabaseKey = computed(() => {
    const sb = config.public.supabase
    return String(sb?.key || config.public.supabaseKey || "").trim()
  })
  const hasSupabase = computed(() => !!supabaseUrl.value && !!supabaseKey.value)
  const checkoutEnabled = computed(() => String(config.public.stripeCheckoutEnabled || "true") !== "false")
  const taxCheckoutEnabled = computed(() => String(config.public.stripeTaxCheckoutEnabled ?? "true") !== "false")

  const checks = computed(() => [
    { id: "supabase", label: "Database and auth (Supabase)", ok: hasSupabase.value, detail: hasSupabase.value ? "Connected." : "Missing Supabase env vars.", tier: "foundation" },
    { id: "stripe-links", label: "Stripe Payment Links (platform fees)", ok: allConfigured.value, detail: allConfigured.value ? "All fee links configured." : configuredCount.value + " of " + links.value.length + " configured.", tier: "payments" },
    { id: "per-item-checkout", label: "Per-item Stripe Checkout", ok: checkoutEnabled.value && hasSupabase.value, detail: checkoutEnabled.value ? (taxCheckoutEnabled.value ? "Buy now: listing amount at checkout; sales tax added from buyer billing address when applicable." : "Buy now creates a session for the listing amount (Edge Functions on Supabase).") : "Checkout disabled in config.", tier: "transactions" },
    { id: "orders-db", label: "Orders table and dashboard", ok: hasSupabase.value, detail: "Orders stored in Supabase; buyers and sellers see them on the dashboard.", tier: "transactions" },
    { id: "escrow-auto", label: "Escrow hold and buyer release", ok: checkoutEnabled.value && hasSupabase.value, detail: "Escrow marks paid + held; buyer confirms on order page to release.", tier: "transactions" },
    { id: "connect", label: "Stripe Connect seller payouts", ok: checkoutEnabled.value && hasSupabase.value, detail: "Sellers use Dashboard — Set up Stripe payouts. Connect checkout splits when enabled.", tier: "transactions" },
  ])

  const foundationOk = computed(() => checks.value.filter((c) => c.tier === "foundation").every((c) => c.ok))
  const paymentsOk = computed(() => checks.value.filter((c) => c.tier === "payments").every((c) => c.ok))
  const transactionsOk = computed(() => checks.value.filter((c) => c.tier === "transactions").every((c) => c.ok))

  const readinessLabel = computed(() => {
    if (transactionsOk.value && paymentsOk.value) return "Full marketplace checkout"
    if (foundationOk.value && checkoutEnabled.value) return "Checkout live"
    if (foundationOk.value) return "Listings only"
    return "Setup needed"
  })

  const readinessSummary = computed(() => {
    if (transactionsOk.value && paymentsOk.value) {
      const taxNote = taxCheckoutEnabled.value
        ? " Listing price is the item total at checkout; applicable sales tax is calculated from the buyer's billing address on Stripe."
        : ""
      return `Buy now uses Stripe Checkout for the listing amount.${taxNote} Orders are tracked; escrow releases when the buyer confirms receipt.`
    }
    if (foundationOk.value && paymentsOk.value) {
      return "Platform fee links work. Per-item Buy now uses Supabase Edge Functions when you are signed in."
    }
    if (foundationOk.value) return "Listings work — payment links need URLs in the production build."
    return "Configure Supabase before taking payments."
  })

  const canCollectFees = computed(() => foundationOk.value && paymentsOk.value)
  const canRunFullTransactions = computed(() => foundationOk.value && transactionsOk.value)

  return { checks, readinessLabel, readinessSummary, canCollectFees, canRunFullTransactions, hasSupabase, allPaymentLinks: allConfigured }
}
