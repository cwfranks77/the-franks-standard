/**
 * Owner console — view/print COA template and binding policies.
 */

import { POLICY_HIERARCHY, POLICY_LAST_UPDATED } from '~/utils/marketplacePolicyMeta.js'
import { SELLER_POLICY_DOCUMENTS, SELLER_POLICY_VERSION } from '~/utils/sellerPolicyBundle.js'
import { COA_FINE_PRINT_FULL, COA_FINE_PRINT_SHORT, SEAL_TITLE } from '~/utils/authenticitySeal.js'
import { COLLECTIBLE_PROOF_REGISTRY } from '~/utils/protectionMessaging.js'

export const OWNER_DOCUMENT_SECTIONS = [
  {
    id: 'coa',
    title: 'Franks Standard COA template',
    desc: 'Floor-office certificate layout with authenticity seal — specimen for office printing.',
    viewPath: '/ops/print/coa',
    printPath: '/ops/print/coa?print=1',
    icon: '📜',
  },
  {
    id: 'pack',
    title: 'COA + policies print pack',
    desc: 'One document: COA specimen, registry rule, policy index, and key legal excerpts.',
    viewPath: '/ops/print/pack',
    printPath: '/ops/print/pack?print=1',
    icon: '🖨️',
  },
]

/** Binding policies — same set sellers sign; open on site or print via ?print=1. */
export const OWNER_POLICY_VIEWS = POLICY_HIERARCHY.map((p) => ({
  label: p.label,
  path: p.path,
  role: p.role,
  printPath: `${p.path}?print=1`,
}))

export const OWNER_SELLER_POLICY_VIEWS = SELLER_POLICY_DOCUMENTS.map((d) => ({
  label: d.label,
  path: d.path,
  printPath: `${d.path}?print=1`,
  required: d.required,
}))

export const COA_TEMPLATE_SPECIMEN_SERIAL = 'FS-2026-000000'

export const COA_TEMPLATE_BODY = {
  title: 'Certificate of Authenticity',
  subtitle: 'The Franks Standard — Floor Office Registry',
  specimenLabel: 'SPECIMEN / OFFICE COPY',
  serial: COA_TEMPLATE_SPECIMEN_SERIAL,
  sellerLabel: 'Seller of record (backs this item)',
  itemLabel: 'Item certified at time of issue',
  verifyLabel: 'Verify at thefranksstandard.com/verify/coa/',
  finePrintFull: COA_FINE_PRINT_FULL,
  finePrintShort: COA_FINE_PRINT_SHORT,
  sealTitle: SEAL_TITLE,
  registryRule: COLLECTIBLE_PROOF_REGISTRY,
  policyVersion: SELLER_POLICY_VERSION,
  policyUpdated: POLICY_LAST_UPDATED,
}

export const PRINT_PACK_POLICY_APPENDIX = [
  {
    heading: 'Marketplace facilitator',
    text:
      'The Franks Standard LLC is a marketplace facilitator, not the seller of listed items and not a guarantor of genuineness. Sellers back collectible listings; the Platform screens, facilitates escrow, and enforces when representations fail.',
  },
  {
    heading: 'Collectible proof (no bypass)',
    text: COLLECTIBLE_PROOF_REGISTRY,
  },
  {
    heading: 'Franks COA',
    text: COA_FINE_PRINT_FULL,
  },
  {
    heading: 'Document index',
    text: 'Full binding text lives on the linked pages below. Seller digital signature version: ' + SELLER_POLICY_VERSION + ' (effective ' + POLICY_LAST_UPDATED + ').',
  },
]
