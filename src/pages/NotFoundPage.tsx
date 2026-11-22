import { SearchX } from 'lucide-react'
import { ButtonLink } from '../components/ButtonLink'
import { EmptyState } from '../components/EmptyState'

export default function NotFoundPage() {
  return (
    <EmptyState
      icon={SearchX}
      message="This page does not exist."
      action={<ButtonLink to="/">Go to the Dashboard</ButtonLink>}
    />
  )
}
