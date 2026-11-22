import { PageHeader } from '../components/PageHeader'
import { ButtonLink } from '../components/ButtonLink'

const steps = [
  { title: 'Create a portfolio', text: 'Group your broker accounts by strategy.', to: '/settings', action: 'Open Settings' },
  { title: 'Add a broker account', text: 'Choose the account currency, USD or ILS.', to: '/settings', action: 'Open Settings' },
  { title: 'Record your first deposit', text: 'Deposits never count as profit.', to: '/transactions', action: 'Open Transactions' },
  { title: 'Add your first trade', text: 'Holdings and cash come from your transactions.', to: '/transactions', action: 'Open Transactions' },
]

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Where do I stand right now?" />
      <section aria-labelledby="get-started" className="rounded-card border border-line bg-card">
        <h2 id="get-started" className="border-b border-line px-6 py-4 font-heading text-lg font-medium">
          Get started
        </h2>
        <ol>
          {steps.map((step, index) => (
            <li key={step.title} className="flex items-center gap-4 border-b border-line px-6 py-4 last:border-0">
              <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas font-mono text-secondary">
                {index + 1}
              </span>
              <div className="flex-1">
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-secondary">{step.text}</p>
              </div>
              <ButtonLink to={step.to}>{step.action}</ButtonLink>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
