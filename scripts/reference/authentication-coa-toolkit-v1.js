// ======================================================
//  THE FRANKS STANDARD – AUTHENTICATION & COA TOOLKIT
//  VERSION 1.0 – JAVASCRIPT (NODE STYLE)
//  AUTHOR: CHARLES FRANKS
// ======================================================
//
// REFERENCE COPY — not imported by the live site.
// Production logic: utils/coinIntegrity.js + authenticityScan + issue-coa-certificate.
// See docs/AUTHENTICITY-TOOLKIT-MAP.md for what was merged vs skipped.

// ======================================================
//  SECTION 1 – IMPORTS & HELPERS
// ======================================================

import crypto from 'crypto'

const uuid = () => crypto.randomUUID()

const sha256 = (data) =>
  crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')

// ======================================================
//  SECTION 2 – COA GENERATOR
// ======================================================

export function generateCOA (item) {
  const payload = {
    title: item.title,
    type: item.type,
    date: item.date,
    mintMark: item.mintMark,
    measurements: item.measurements,
    images: item.images,
    createdAt: new Date().toISOString(),
  }

  const hash = sha256(payload)

  return {
    coaId: uuid(),
    hash,
    payload,
  }
}

// ======================================================
//  SECTION 3 – MEASUREMENT VALIDATION
// ======================================================

export function validateMeasurements (measurements) {
  const missing = []

  if (!measurements.weight) missing.push('weight')
  if (!measurements.diameter) missing.push('diameter')
  if (!measurements.thickness) missing.push('thickness')

  return {
    valid: missing.length === 0,
    missing,
  }
}

// ======================================================
//  SECTION 4 – SUBMISSION SCORING ENGINE
// ======================================================

export function scoreSubmission (submission) {
  const { weight, diameter, thickness, magnetResult } = submission.measurements
  const { type } = submission.metadata

  let score = 100
  const flags = []

  if (type === 'Morgan Dollar') {
    if (Math.abs(weight - 26.73) > 0.2) {
      score -= 40
      flags.push('Weight out of tolerance')
    }
    if (Math.abs(diameter - 38.1) > 0.1) {
      score -= 20
      flags.push('Diameter out of tolerance')
    }
    if (Math.abs(thickness - 2.4) > 0.1) {
      score -= 10
      flags.push('Thickness out of tolerance')
    }
    if (magnetResult === 'attracted') {
      score -= 60
      flags.push('Magnetic – should not be')
    }
  }

  return { score, flags }
}

// ======================================================
//  SECTION 5 – HIGH-RISK COIN RULES
// ======================================================

export function highRiskCheck (metadata, price) {
  const { type, date, mintMark } = metadata
  const risks = []

  const keyDates = ['1885-CC', '1889-CC', '1893-S']
  const full = `${date}${mintMark ? '-' + mintMark : ''}`

  if (type === 'Morgan Dollar' && keyDates.includes(full)) {
    risks.push('Key date Morgan Dollar – high counterfeit risk')

    if (price < 300) {
      risks.push('Suspiciously low price for key date')
    }
  }

  return risks
}

// ======================================================
//  SECTION 6 – RISK RULES ENGINE
// ======================================================

export function evaluateRisk (submission, seller) {
  const measurementCheck = validateMeasurements(submission.measurements)
  const scoring = scoreSubmission(submission)
  const highRisk = highRiskCheck(submission.metadata, submission.price)

  let riskLevel = 'LOW'

  if (!measurementCheck.valid) riskLevel = 'MEDIUM'
  if (scoring.score < 70) riskLevel = 'HIGH'
  if (highRisk.length > 0) riskLevel = 'HIGH'
  if (seller.trustScore < 50) riskLevel = 'HIGH'

  return {
    riskLevel,
    measurementCheck,
    scoring,
    highRisk,
  }
}

// ======================================================
//  SECTION 7 – SELLER TRUST SCORE
// ======================================================

export function updateSellerTrust (seller, result) {
  let trust = seller.trustScore || 50

  if (result === 'approved') trust += 2
  if (result === 'rejected') trust -= 5
  if (result === 'counterfeit') trust -= 20

  if (trust > 100) trust = 100
  if (trust < 0) trust = 0

  return trust
}

// ======================================================
//  SECTION 8 – LISTING GATEKEEPER
// ======================================================

export function canPublishListing (listing, coa, sellerId) {
  if (!coa) return { allowed: false, reason: 'COA not found' }
  if (coa.payload.sellerId && coa.payload.sellerId !== sellerId) {
    return { allowed: false, reason: 'COA does not belong to seller' }
  }
  if (coa.payload.itemId && coa.payload.itemId !== listing.id) {
    return { allowed: false, reason: 'COA not bound to this item' }
  }
  if (coa.revoked) return { allowed: false, reason: 'COA revoked' }

  const recalculatedHash = sha256(coa.payload)
  if (recalculatedHash !== coa.hash) {
    return { allowed: false, reason: 'COA hash mismatch – tampering suspected' }
  }

  return { allowed: true }
}

// ======================================================
//  SECTION 9 – MANUAL REVIEW QUEUE
// ======================================================

export function needsManualReview (riskReport) {
  return (
    riskReport.riskLevel === 'HIGH'
    || !riskReport.measurementCheck.valid
    || riskReport.highRisk.length > 0
  )
}

// ======================================================
//  SECTION 10 – EXPORTS
// ======================================================

export default {
  generateCOA,
  validateMeasurements,
  scoreSubmission,
  highRiskCheck,
  evaluateRisk,
  updateSellerTrust,
  canPublishListing,
  needsManualReview,
}
