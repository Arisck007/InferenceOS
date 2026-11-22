import { useMemo, useState, type ReactNode } from 'react'
import { ALL_PORTFOLIOS, ScopeContext, type Currency } from './scope'

export function ScopeProvider({ children }: { children: ReactNode }) {
  const [portfolioId, setPortfolioId] = useState(ALL_PORTFOLIOS)
  const [currency, setCurrency] = useState<Currency>('USD')

  const value = useMemo(
    () => ({ portfolioId, setPortfolioId, currency, setCurrency }),
    [portfolioId, currency],
  )

  return <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>
}
