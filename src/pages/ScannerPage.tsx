import { Radar } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'

export default function ScannerPage() {
  return (
    <>
      <PageHeader title="Scanner" description="Which holdings are near a buy zone?" />
      <EmptyState icon={Radar} message="No holdings to scan yet." />
    </>
  )
}
