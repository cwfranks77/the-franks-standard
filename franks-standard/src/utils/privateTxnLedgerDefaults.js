/** Starter rows for the B&C owner private transaction ledger (Stripe / tax / wholesaler). */
export const DEFAULT_PRIVATE_TXN_LEDGER = {
  transactions: [
    {
      id: 'tx-demo-stripe-1',
      date: '2026-06-11 14:22',
      account: 'STRIPE-REVENUE',
      desc: 'PETRA-DEN-4K9CH Consumer Invoice Settlement',
      amount: '+$1,394.45',
      isCredit: true,
    },
    {
      id: 'tx-demo-tax-1',
      date: '2026-06-11 09:15',
      account: 'LA-TAX-RESERVE',
      desc: 'Quarterly State Sales Tax Allocation Escrow',
      amount: '-$240.10',
      isCredit: false,
    },
    {
      id: 'tx-demo-wholesale-1',
      date: '2026-06-11 11:30',
      account: 'MERCURY-BANK',
      desc: 'Petra Distribution Wholesaler Ledger Clearing',
      amount: '-$899.60',
      isCredit: false,
    },
  ],
}
