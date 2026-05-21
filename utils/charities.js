/** Curated charities sellers can donate sale proceeds to (plain JS). */
export const CHARITY_OPTIONS = [
  { key: 'st-jude', name: "St. Jude Children's Research Hospital", tagline: 'Pediatric cancer research and treatment - families never receive a bill.', website: 'https://www.stjude.org/' },
  { key: 'habitat', name: 'Habitat for Humanity', tagline: 'Affordable housing for families in need of a decent place to live.', website: 'https://www.habitat.org/' },
  { key: 'red-cross', name: 'American Red Cross', tagline: 'Disaster relief, blood services, and emergency support.', website: 'https://www.redcross.org/' },
  { key: 'feeding-america', name: 'Feeding America', tagline: 'Nationwide network of food banks fighting hunger.', website: 'https://www.feedingamerica.org/' },
  { key: 'goodwill', name: 'Goodwill Industries', tagline: 'Job training and community programs funded by resale.', website: 'https://www.goodwill.org/' },
  { key: 'wounded-warrior', name: 'Wounded Warrior Project', tagline: 'Programs for veterans and service members injured on or after 9/11.', website: 'https://www.woundedwarriorproject.org/' },
  { key: 'make-a-wish', name: 'Make-A-Wish Foundation', tagline: 'Life-changing wishes for children with critical illnesses.', website: 'https://wish.org/' },
]

export function charityByKey (key) {
  return CHARITY_OPTIONS.find((c) => c.key === key) || null
}