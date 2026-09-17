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
import { getDefaultRouteForRole } from './roleDefaults'

export default function AppRoutes() {
  const { isAuthenticated, user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated && user
          ? <Navigate to={getDefaultRouteForRole(user.role)} />
          : <LoginPage />
      } />

      {/* Dashboard e relatórios: só ADMIN e MANAGER (mesma regra do DashboardController) */}
      <Route path="/" element={
        <PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}>
          <DashboardPage />
        </PrivateRoute>
      } />

      {/* Clientes: ADMIN e RECEPTIONIST cadastram; MANAGER só para relatórios (ClientController) */}
      <Route path="/clients" element={
        <PrivateRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'MANAGER']}>
          <ClientsPage />
        </PrivateRoute>
      } />

      {/* Veículos: mesmos papéis de Clientes, mais MECHANIC (precisa consultar/atualizar km) */}
      <Route path="/vehicles" element={
        <PrivateRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'MANAGER', 'MECHANIC']}>
          <VehiclesPage />
        </PrivateRoute>
      } />

      {/* Equipe de mecânicos: gestão por ADMIN/MANAGER; RECEPTIONIST só consulta para atribuir OS */}
      <Route path="/mechanics" element={
        <PrivateRoute allowedRoles={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
          <MechanicsPage />
        </PrivateRoute>
      } />

      {/*
        Ordens de serviço: MECHANIC só enxerga/atualiza a própria OS no backend
        (ServiceOrderService.assertCanAccessOrder). A listagem completa (GET /service-orders)
        continua restrita a ADMIN/MANAGER/RECEPTIONIST — um MECHANIC autenticado acessa esta
        rota, mas a tela precisa buscar a OS por ID (ex.: a partir de uma notificação/atribuição)
        em vez de chamar a listagem geral, que o backend vai recusar com 403 para esse papel.
      */}
      <Route path="/service-orders" element={
        <PrivateRoute allowedRoles={['ADMIN', 'MANAGER', 'RECEPTIONIST', 'MECHANIC']}>
          <ServiceOrdersPage />
        </PrivateRoute>
      } />

      {/* Orçamentos: criação/consulta por ADMIN/RECEPTIONIST/MANAGER; aprovar é ADMIN/MANAGER (BudgetController) */}
      <Route path="/budgets" element={
        <PrivateRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'MANAGER']}>
          <BudgetsPage />
        </PrivateRoute>
      } />

      {/* Estoque: restrito a ADMIN/MANAGER (InventoryController) */}
      <Route path="/inventory" element={
        <PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}>
          <InventoryPage />
        </PrivateRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
