/**
 * How the Franks Standard COA works — shared product + policy language.
 * Not legal advice. Attorney should review before relying in advertising or litigation.
 *
 * Key distinction:
 * - "Seller Written Guarantee" = seller's attestation ON the Franks COA (digitally attached in registry).
 * - Platform = template + serial registry + verification + policy enforcement — NOT guarantor of genuineness.
 */

export const FRANKS_COA_SERIAL_FORMAT = 'FS-YYYY-NNNNNN'

export const SELLER_WRITTEN_GUARANTEE_LABEL = 'Seller Written Guarantee on the Franks Standard COA'

/** One sentence for cards and radio labels */
export const FRANKS_COA_OPTION_LEAD =
  'Franks Standard COA with your Seller Written Guarantee digitally attached to one serial — bound to this listing\'s photos and description at issue.'

/** Plain-language definition (sell flow, protection, verify hub) */
export const SELLER_WRITTEN_GUARANTEE_DEFINITION =
  'The Seller Written Guarantee is your legally binding authenticity statement that is printed on the Franks Standard Certificate of Authenticity and stored in our registry with your legal name, listing ID, and a unique serial number. It is your guarantee to buyers — not a guarantee, warranty, or certification by The Franks Standard LLC.'

/** Language intended for the certificate body (placeholders replaced at issue). */
export const SELLER_WRITTEN_GUARANTEE_CERTIFICATE_TEXT =
  'I, the seller named on this certificate, certify that the item shown in the listing photographs and described in the certified description frozen at issue time is authentic and as represented by me. I understand that The Franks Standard LLC provides this certificate template and serial registry only and does not guarantee or warrant that this item is genuine. If this item is later proven counterfeit or materially misrepresented, I may be subject to Marketplace Policy enforcement, including refunds, account action, and permanent ban.'

export const FRANKS_COA_HOW_IT_WORKS_STEPS = [
  {
    title: 'One item, one serial',
    desc: `Each Franks COA receives a unique floor-office serial (${FRANKS_COA_SERIAL_FORMAT}). That serial may not be reused on another listing or item.`,
  },
  {
    title: 'Digitally attached to your listing',
    desc: 'At publish, we freeze your listing photos and description into a certificate fingerprint and attach your Seller Written Guarantee to that record in our registry.',
  },
  {
    title: 'Buyers verify before they trust',
    desc: 'Anyone can look up the serial at /verify/coa. The registry must match the listing the buyer is viewing — same office, same item snapshot.',
  },
  {
    title: 'We facilitate — you guarantee',
    desc: 'The Franks Standard provides the template, serial, registry, and enforcement rules. You — the seller — make the authenticity representation; we do not warrant the item is genuine.',
  },
]

export const PLATFORM_ROLE_BULLETS = [
  'Issues the COA template and serial number',
  'Stores the certificate and Seller Written Guarantee in the registry',
  'Hosts public verification at /verify/coa/[serial]',
  'Enforces Marketplace Policies when an item is proven fake or misrepresented',
]

export const PLATFORM_DOES_NOT_BULLETS = [
  'Does not guarantee, warrant, certify, or authenticate that any item is genuine',
  'Does not replace third-party grading (PSA, PCGS, etc.) when you claim graded inventory',
  'Does not insure items or act as an expert appraiser',
]

/** Full disclosure (verify page, legal-adjacent UI) */
export const COA_FINE_PRINT_FULL =
  `${SELLER_WRITTEN_GUARANTEE_DEFINITION} ` +
  'A Franks Standard COA links one listing\'s photos and description to one serial at the time of issue. ' +
  'The Platform may enforce Marketplace Policies (including refunds and account action) when an item is proven counterfeit or misrepresented; that enforcement does not mean the Platform vouched for authenticity at sale.'

/** Short disclosure (listing cards, compact UI) */
export const COA_FINE_PRINT_SHORT =
  'Franks COA = Seller Written Guarantee on our template + serial registry. Not a Platform guarantee of authenticity. See Terms and Marketplace Policies.'

/** Third-party upload path (no Franks serial) */
export const UPLOADED_COA_DISCLOSURE =
  'You upload a third-party COA (PSA, PCGS, issuer, etc.). The seller backs the listing; The Franks Standard does not guarantee third-party certificate content.'

/** Printed on every Franks-issued certificate body */
export const COA_NON_TRANSFERABLE_NOTICE =
  'NON-TRANSFERABLE: This certificate is permanently bound to one listing, one item snapshot, and one serial number. ' +
  'It may not be reassigned, transferred to another item, or reused on a different listing.'

/** Anti-copy language for branded COA documents */
export const COA_ANTI_COPY_NOTICE =
  'Each official copy carries a unique copy ID watermarked across the page with The Franks Standard seal. ' +
  'Photocopies or reprints without a valid copy ID issued from thefranksstandard.com will not verify. ' +
  'Request additional copies only through your account — every copy is documented in our registry.'

/** Owner console + seller hub — steps before any COA print or issue */
export const COA_SELLER_REQUIREMENT_STEPS = [
  {
    id: 'thumbnails',
    title: 'Item thumbnail photos',
    desc: 'Upload at least one clear photo of the actual item. Photo 1 is frozen on the certificate as the certified thumbnail.',
  },
  {
    id: 'description',
    title: 'Brief item description',
    desc: 'Minimum 20 characters — what the item is, condition, and any serial or grade visible on the piece.',
  },
  {
    id: 'serial',
    title: 'Platform serial assigned',
    desc: `Server-issued registry serial (${FRANKS_COA_SERIAL_FORMAT}) — one per listing, never reused.`,
  },
  {
    id: 'signature',
    title: 'Seller Written Guarantee',
    desc: 'Your full legal name as electronic signature on the Franks COA at publish.',
  },
  {
    id: 'verified',
    title: 'Backend verification',
    desc: 'Our system authenticates the document, binds the file hash, and logs chain-of-custody before print unlocks.',
  },
]

/** Strict anti-fraud protections — emphasize in owner + seller COA UI */
export const COA_FRAUD_PROTECTION_BULLETS = [
  'COAs are NEVER transferable — permanently bound to one listing, one item snapshot, and one serial. There is no step after which transfer becomes allowed.',
  'Print, download, and buyer access stay locked until item thumbnails, description, serial, and backend verification are complete.',
  'Every official copy is watermarked with our seal, a unique copy ID, and logged — unauthorized photocopies fail verification.',
  'Third-party COA uploads are fingerprinted (SHA-256); duplicate files and reused issuer serials on other listings are blocked.',
  'Listing photos and description are frozen into a certificate fingerprint — changing them after issue invalidates print until re-synced.',
  'Buyers verify serials and copy IDs at /verify/coa before trusting a certificate.',
  'Proven counterfeit or misrepresented items trigger enforcement: refunds, COA revocation, account action, and permanent ban.',
]

/** Owner / seller hub lead — no “until transferable” wording */
export const COA_OWNER_MANAGER_LEAD =
  'Strict COA registry: sellers upload item thumbnails and complete all requirements before print. Certificates are never transferable to another item — fraud protections are enforced server-side.'

/** Legacy standalone guarantee form (retired for new listings) */
export const LEGACY_STANDALONE_GUARANTEE_NOTE =
  'Older listings may show a retired standalone guarantee form. New collectible listings must use uploaded third-party COA or a Franks Standard COA with Seller Written Guarantee — not a separate signature-only form.'
