import { ArrowLeftRight } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'

export default function TransactionsPage() {
  return (
    <>
      <PageHeader title="Transactions" description="What happened in my account, and when?" />
      <EmptyState icon={ArrowLeftRight} message="No transactions yet." />
    </>
  )
}
