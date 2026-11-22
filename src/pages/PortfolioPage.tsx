import { PieChart } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'

export default function PortfolioPage() {
  return (
    <>
      <PageHeader title="Portfolio" description="What do I own and how is each position doing?" />
      <EmptyState icon={PieChart} message="No holdings yet." />
    </>
  )
}
