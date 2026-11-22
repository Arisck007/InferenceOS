import { ALL_PORTFOLIOS, useScope } from '../app/scope'
import { portfolios } from '../mock/portfolios'

/** Portfolio selector shared by the top bar and the portfolio prompt. */
export function PortfolioSelect({ label }: { label: string }) {
  const { portfolioId, setPortfolioId } = useScope()

  return (
    <select
      aria-label={label}
      value={portfolioId}
      onChange={(event) => setPortfolioId(event.target.value)}
      className="h-9 whitespace-nowrap rounded-control border border-line bg-canvas px-3"
    >
      <option value={ALL_PORTFOLIOS}>Total (All)</option>
      {portfolios.map((portfolio) => (
        <option key={portfolio.id} value={portfolio.id}>
          {portfolio.name}
        </option>
      ))}
    </select>
  )
}
