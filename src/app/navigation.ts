import {
  ArrowLeftRight,
  BookOpen,
  LayoutDashboard,
  ListOrdered,
  PieChart,
  Radar,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  path: string
  label: string
  icon: LucideIcon
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

/** Sidebar groups and V1 screens. */
export const navigation: NavGroup[] = [
  { title: 'Dashboard', items: [{ path: '/', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    title: 'Portfolio',
    items: [
      { path: '/portfolio', label: 'Portfolio', icon: PieChart },
      { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
      { path: '/scenario-book', label: 'Scenario Book', icon: BookOpen },
      { path: '/orders', label: 'Orders', icon: ListOrdered },
    ],
  },
  { title: 'Intelligence', items: [{ path: '/scanner', label: 'Scanner', icon: Radar }] },
  { title: 'System', items: [{ path: '/settings', label: 'Settings', icon: Settings }] },
]
