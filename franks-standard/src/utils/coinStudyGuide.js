/**
 * Coin authentication study guide — public /learn/tools/coin-study-guide
 * Full printable text also in docs/COIN-STUDY-GUIDE-AUTHENTICATION.txt
 */

export const COIN_STUDY_META = {
  title: 'Coin Study Guide',
  subtitle: 'Authentication, history, and counterfeit detection',
  author: 'The Franks Standard',
  version: '1.0',
  disclaimer:
    'Educational reference only — not professional grading or legal advice. High-value coins should be verified by PCGS, NGC, ANACS, or a trusted dealer.',
}

/** @typedef {{ title: string, items: string[] }} GuideList */
/** @typedef {{ title: string, body?: string[], lists?: GuideList[], tip?: string }} GuideSubsection */
/** @typedef {{ id: string, title: string, subsections: GuideSubsection[] }} GuideSection */

export const COIN_STUDY_SECTIONS = /** @type {GuideSection[]} */ ([
  {
    id: '1',
    title: 'How real coins are made (and why it matters)',
    subsections: [
      {
        title: 'Struck vs cast — the core concept',
        body: [
          'Real coins from official mints are STRUCK: a blank planchet is placed between hardened steel dies; a press applies massive pressure; metal flows into the design, creating sharp details and flow lines.',
          'Most counterfeits are CAST: a real coin is used to make a mold; molten metal is poured in; the copy has softer details and casting defects.',
        ],
        lists: [
          {
            title: 'Key differences',
            items: [
              'STRUCK: sharp edges, crisp letters, strong relief, cartwheel luster.',
              'CAST: rounded letters, mushy details, pits, bubbles, seam lines, dead luster.',
              'If you remember nothing else: REAL = STRUCK, FAKE = USUALLY CAST.',
            ],
          },
        ],
      },
      {
        title: 'Metal flow and luster',
        body: [
          'When a coin is struck, metal flows outward from the center toward the rim, creating microscopic flow lines. On silver, tilting the coin under a single light produces cartwheel luster — light that appears to roll around the surface.',
        ],
        lists: [
          {
            title: 'Real silver',
            items: ['Strong, directional luster.', 'Light rolls around the surface when tilted.'],
          },
          {
            title: 'Fake / cast',
            items: [
              'Dull, flat, or dead surface.',
              'No cartwheel pattern.',
              'Often grainy or powdery under magnification.',
            ],
          },
        ],
      },
      {
        title: 'Why certain coins are counterfeited more',
        body: ['Counterfeiters go where the money is. If a coin is worth far more than melt, it will be faked.'],
        lists: [
          {
            title: 'High-value targets',
            items: [
              'Morgan dollars: 1885-CC, 1889-CC, 1893-S, key dates, CC mint marks.',
              'Early U.S. gold.',
              'Key-date cents and nickels.',
              'Modern bullion: ASEs, Maple Leafs, Krugerrands.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Universal authentication framework',
    subsections: [
      {
        title: 'The 10-point checklist',
        lists: [
          {
            title: '1) Weight',
            items: [
              'Use a digital scale (0.01 g resolution).',
              'Compare to official specs; >~0.2 g off on classics is suspicious.',
            ],
          },
          {
            title: '2) Diameter',
            items: ['Use calipers; even 0.1 mm off can matter.'],
          },
          {
            title: '3) Thickness',
            items: ['Too thick or thin is a red flag.'],
          },
          {
            title: '4) Metal / magnet test',
            items: ['Silver, gold, and most legit alloys are not magnetic.'],
          },
          {
            title: '5) Edge / reeding',
            items: [
              'Real reeding: sharp, even, consistent.',
              'Fake: soft, uneven, shallow, or irregular.',
            ],
          },
          {
            title: '6) Letter sharpness',
            items: [
              'Real: crisp serifs and corners.',
              'Fake: rounded, swollen, melted, filled letters.',
            ],
          },
          {
            title: '7) Design details',
            items: ['Compare eyes, hair, feathers, stars, date to a known genuine example.'],
          },
          {
            title: '8) Surface texture',
            items: [
              'Real: metallic, crystalline, natural wear.',
              'Fake: grainy, bubbly, pitted, cast texture.',
            ],
          },
          {
            title: '9) Sound test (ping)',
            items: [
              'Real silver: clear ring that lasts.',
              'Fake: dull, short, clunky.',
            ],
          },
          {
            title: '10) Context and price',
            items: [
              'Price far below market for a key date or mint → assume fake until proven real.',
            ],
          },
        ],
      },
      {
        title: 'Quick visual tests',
        lists: [
          {
            title: 'Tilt test',
            items: ['Look for cartwheel luster on silver; none on claimed UNC is suspicious.'],
          },
          {
            title: 'Rim shadow test',
            items: ['Real: sharp rim and clean shadow; fake: soft or fuzzy rim.'],
          },
          {
            title: 'Denticle rhythm',
            items: ['Real: even teeth around rim; fake: irregular spacing or depth.'],
          },
          {
            title: 'Eye test',
            items: ['Real portrait eyes have defined lid and pupil; fakes often blob or smear.'],
          },
          {
            title: 'Metal flow test',
            items: ['Radial flow lines under magnification on struck silver; fakes show random grain.'],
          },
        ],
      },
    ],
  },
  {
    id: '3',
    title: 'Morgan dollar specialist section',
    subsections: [
      {
        title: 'Basic facts',
        lists: [
          {
            title: 'Specs',
            items: [
              'Minted 1878–1904, 1921.',
              '90% silver, 10% copper.',
              'Weight: 26.73 g · Diameter: 38.1 mm · Edge: reeded.',
            ],
          },
          {
            title: 'Mint marks',
            items: [
              '(none) Philadelphia · CC Carson City · O New Orleans · S San Francisco · D Denver (1921 only).',
            ],
          },
        ],
      },
      {
        title: 'Dangerous dates',
        body: ['1885-CC, 1889-CC, and 1893-S are prime counterfeit targets — raise suspicion automatically.'],
      },
      {
        title: 'LIBERTY diagnostics (obverse)',
        lists: [
          {
            title: 'Real',
            items: [
              'Crisp L, I, B, E, R, T, Y on the headband; open E; defined R serif.',
            ],
          },
          {
            title: 'Fake',
            items: [
              'E looks like O or C; R smeared; letters swollen into the band; missing serifs.',
            ],
          },
        ],
      },
      {
        title: 'CC mint mark (reverse)',
        body: ['Location: above DO in DOLLAR, between wreath and bow.'],
        lists: [
          {
            title: 'Real CC',
            items: ['Small, crisp; even spacing; correct height; sharp serifs.'],
          },
          {
            title: 'Fake CC',
            items: [
              'Wrong size or position; uneven C spacing; mushy edges; looks tooled or added.',
            ],
          },
        ],
      },
      {
        title: 'Common fake patterns',
        lists: [
          {
            title: 'Cast copies',
            items: ['Soft stars, mushy hair, weak eagle feathers, rounded denticles.'],
          },
          {
            title: 'Added mint marks',
            items: [
              'Common-date host coin; CC or S added — look for scratches and disturbed metal at the mark.',
            ],
          },
        ],
        tip: 'Online red flags: key date + “uncirculated” + price near generic silver; mint field (S) doesn’t match title; micro-voids on jaw/neck; fake PCGS slabs at $50–$90.',
      },
    ],
  },
  {
    id: '4',
    title: 'Fake vs real comparison',
    subsections: [
      {
        title: 'Obverse',
        lists: [
          {
            title: 'Real',
            items: [
              'Hair strands visible; sharp eye; crisp LIBERTY; sharp stars.',
            ],
          },
          {
            title: 'Fake',
            items: [
              'Melted hair clumps; blob eye; rounded LIBERTY letters; soft stars.',
            ],
          },
        ],
      },
      {
        title: 'Reverse',
        lists: [
          {
            title: 'Real',
            items: [
              'Layered eagle feathers; sharp wreath veins; crisp UNITED STATES OF AMERICA.',
            ],
          },
          {
            title: 'Fake',
            items: [
              'Flat eagle breast; blended wing feathers; blob leaves; swollen letters.',
            ],
          },
        ],
      },
      {
        title: 'Edge',
        lists: [
          {
            title: 'Real',
            items: ['Consistent sharp reeding; no casting seam.'],
          },
          {
            title: 'Fake',
            items: ['Shallow or uneven reeding; faint seam line possible.'],
          },
        ],
      },
    ],
  },
  {
    id: '5',
    title: 'Other coin types',
    subsections: [
      {
        title: 'Silver bullion (e.g. American Silver Eagle)',
        lists: [
          {
            title: 'Real ASE',
            items: ['31.103 g · 40.6 mm · reeded edge · bright luster.'],
          },
          {
            title: 'Fake ASE',
            items: ['Wrong weight/diameter; dead luster; off fonts.'],
          },
        ],
      },
      {
        title: 'Copper cents',
        lists: [
          {
            title: 'Real',
            items: ['Sharp letters; clear date/mint; natural toning.'],
          },
          {
            title: 'Fake',
            items: ['Blurry letters; wrong date style; artificial surface.'],
          },
        ],
      },
      {
        title: 'Nickels',
        lists: [
          {
            title: 'Real',
            items: ['Strong hair / bison detail; correct fonts.'],
          },
          {
            title: 'Fake',
            items: ['Soft detail; wrong numerals; odd surface under magnification.'],
          },
        ],
      },
    ],
  },
  {
    id: '6',
    title: 'Authenticator mindset',
    subsections: [
      {
        title: 'Suspicion first, trust later',
        body: ['On high-value coins, assume fake until weight, edge, comps, and (if needed) certification prove otherwise.'],
      },
      {
        title: 'Compare, compare, compare',
        body: ['Match date, mint, and type to a known genuine example until your eye learns the “look” of real vs fake.'],
      },
      {
        title: 'Document everything',
        body: ['Log weight, diameter, thickness, magnet result, and visual notes for every serious examination.'],
      },
      {
        title: 'Keep learning',
        body: [
          'Study certified examples (PCGS, NGC, ANACS), auction archives, and grading-service counterfeit alerts.',
        ],
      },
    ],
  },
  {
    id: '7',
    title: 'Certification roadmap',
    subsections: [
      {
        title: 'Path',
        lists: [
          {
            title: 'Steps',
            items: [
              'Learn strike vs cast and the 10-point checklist (this guide).',
              'Study Sheldon grading and wear vs weak strike.',
              'Study known fakes for your specialty dates.',
              'Optional: ANA courses and grading seminars.',
              'Build a portfolio of examined coins with photos and notes.',
            ],
          },
        ],
      },
    ],
  },
])

export const COIN_STUDY_TOC = COIN_STUDY_SECTIONS.map((s) => ({
  id: s.id,
  title: s.title,
  anchor: `section-${s.id}`,
}))
