import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Wrench, FileText, Settings, LogOut } from 'lucide-react'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clienti', icon: Users, label: 'Clienti' },
  { to: '/schede', icon: Wrench, label: 'Schede Lavoro' },
  { to: '/preventivi', icon: FileText, label: 'Preventivi' },
  { to: '/impostazioni', icon: Settings, label: 'Impostazioni' },
]

export default function Layout() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-dark">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-light border-r border-dark-lighter flex flex-col">
        <div className="p-6 border-b border-dark-lighter">
          <h1 className="text-2xl font-bold text-primary italic">P.R. MOTO</h1>
          <p className="text-xs text-gray-light mt-1">Vendita Moto e Assistenza</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-light hover:bg-dark-lighter hover:text-white'
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-dark-lighter">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-light hover:bg-dark-lighter hover:text-white transition-colors w-full"
          >
            <LogOut size={20} />
            <span>Esci</span>
          </button>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
