import { createContext, useContext } from 'react'

export type Currency = 'USD' | 'ILS'

export const ALL_PORTFOLIOS = 'all'

export interface Scope {
  portfolioId: string
  setPortfolioId: (id: string) => void
  currency: Currency
  setCurrency: (currency: Currency) => void
}

export const ScopeContext = createContext<Scope | null>(null)

/** The portfolio and display currency selected in the top bar. */
export function useScope(): Scope {
  const scope = useContext(ScopeContext)
  if (!scope) throw new Error('useScope must be used inside ScopeProvider')
  return scope
}
