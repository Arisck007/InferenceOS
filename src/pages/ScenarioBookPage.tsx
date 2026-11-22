import { BookOpen } from 'lucide-react'
import { ALL_PORTFOLIOS, useScope } from '../app/scope'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { PortfolioSelect } from '../components/PortfolioSelect'

export default function ScenarioBookPage() {
  const { portfolioId } = useScope()

  return (
    <>
      <PageHeader title="Scenario Book" description="Where will I buy, how much, and can I afford it?" />
      {portfolioId === ALL_PORTFOLIOS ? (
        <EmptyState
          icon={BookOpen}
          message="Scenario Book works on one portfolio at a time."
          action={<PortfolioSelect label="Choose a portfolio" />}
        />
      ) : (
        <EmptyState icon={BookOpen} message="No buy ladders yet." />
      )}
    </>
  )
}
