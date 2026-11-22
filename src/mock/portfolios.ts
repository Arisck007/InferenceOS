export interface Portfolio {
  id: string
  name: string
}

/** Fictional portfolios used until the database is connected. */
export const portfolios: Portfolio[] = [
  { id: 'long-term', name: 'Long-term' },
  { id: 'retirement', name: 'Retirement' },
]
