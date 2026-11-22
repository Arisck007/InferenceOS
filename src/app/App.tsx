import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { ScopeProvider } from './ScopeProvider'

const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const PortfolioPage = lazy(() => import('../pages/PortfolioPage'))
const TransactionsPage = lazy(() => import('../pages/TransactionsPage'))
const ScenarioBookPage = lazy(() => import('../pages/ScenarioBookPage'))
const OrdersPage = lazy(() => import('../pages/OrdersPage'))
const ScannerPage = lazy(() => import('../pages/ScannerPage'))
const SettingsPage = lazy(() => import('../pages/SettingsPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

export function App() {
  return (
    <ScopeProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/scenario-book" element={<ScenarioBookPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ScopeProvider>
  )
}
