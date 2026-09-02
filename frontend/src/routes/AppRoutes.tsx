import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ClientsPage from '@/pages/ClientsPage'
import VehiclesPage from '@/pages/VehiclesPage'
import MechanicsPage from '@/pages/MechanicsPage'
import ServiceOrdersPage from '@/pages/ServiceOrdersPage'
import BudgetsPage from '@/pages/BudgetsPage'
import InventoryPage from '@/pages/InventoryPage'
import PrivateRoute from './PrivateRoute'

export default function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" /> : <LoginPage />
      } />
      <Route path="/" element={
        <PrivateRoute>
          <DashboardPage />
        </PrivateRoute>
      } />
      <Route path="/clients" element={
        <PrivateRoute>
          <ClientsPage />
        </PrivateRoute>
      } />
      <Route path="/vehicles" element={
        <PrivateRoute>
          <VehiclesPage />
        </PrivateRoute>
      } />
      <Route path="/mechanics" element={
        <PrivateRoute>
          <MechanicsPage />
        </PrivateRoute>
      } />
      <Route path="/service-orders" element={
        <PrivateRoute>
          <ServiceOrdersPage />
        </PrivateRoute>
      } />
      <Route path="/budgets" element={
        <PrivateRoute>
          <BudgetsPage />
        </PrivateRoute>
      } />
      <Route path="/inventory" element={
        <PrivateRoute>
          <InventoryPage />
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}