import { ListOrdered } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'

export default function OrdersPage() {
  return (
    <>
      <PageHeader title="Orders" description="Which orders need my action, are working or are done?" />
      <EmptyState icon={ListOrdered} message="No orders yet." />
    </>
  )
}
