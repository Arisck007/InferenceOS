import { Settings } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Portfolios, accounts, currency, import and health." />
      <EmptyState icon={Settings} message="No settings available yet." />
    </>
  )
}
