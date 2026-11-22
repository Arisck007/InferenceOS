import { useScope, type Currency } from '../app/scope'
import { PortfolioSelect } from './PortfolioSelect'

const currencies: Currency[] = ['USD', 'ILS']

export function TopBar() {
  const { currency, setCurrency } = useScope()

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-line bg-canvas px-8">
      <PortfolioSelect label="Portfolio" />
      <div role="group" aria-label="Display currency" className="flex rounded-control border border-line p-0.5">
        {currencies.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={currency === option}
            onClick={() => setCurrency(option)}
            className={`rounded-badge px-3 py-1 font-mono ${
              currency === option ? 'bg-brand-hover text-white' : 'text-secondary hover:bg-hover'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <span className="ml-auto rounded-badge bg-warning/10 px-2 py-1 text-xs font-semibold text-warning">
        Mock data
      </span>
    </header>
  )
}
