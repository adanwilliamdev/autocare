import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  UsersIcon,
  TruckIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  CubeIcon,
} from '@heroicons/react/24/outline'

const menuItems = [
  { path: '/', label: 'Dashboard', icon: HomeIcon },
  { path: '/clients', label: 'Clientes', icon: UsersIcon },
  { path: '/vehicles', label: 'Veículos', icon: TruckIcon },
  { path: '/mechanics', label: 'Mecânicos', icon: UserGroupIcon },
  { path: '/service-orders', label: 'Ordens de Serviço', icon: ClipboardDocumentListIcon },
  { path: '/budgets', label: 'Orçamentos', icon: CurrencyDollarIcon },
  { path: '/inventory', label: 'Estoque', icon: CubeIcon },
]

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 w-64 h-full bg-gray-900 text-white">
      <div className="p-4">
        <h1 className="text-2xl font-bold">🚗 AutoCare</h1>
        <p className="text-sm text-gray-400">Sistema de Gestão</p>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}