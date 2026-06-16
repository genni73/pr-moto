import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Wrench, FileText, Settings, LogOut, Menu, X } from 'lucide-react'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    setMobileMenuOpen(false)
    await signOut(auth)
    navigate('/login')
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="flex h-screen bg-dark">
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-dark-light border-b border-dark-lighter px-4 py-3 lg:hidden">
        <h1 className="text-xl font-bold text-primary italic">P.R. MOTO</h1>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="text-gray-light hover:text-white transition-colors"
          aria-label="Apri menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileMenu}
      />

      {/* Sidebar — desktop: static, mobile: slide-in overlay */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-dark-light border-r border-dark-lighter flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-dark-lighter flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary italic">P.R. MOTO</h1>
            <p className="text-xs text-gray-light mt-1">Vendita Moto e Assistenza</p>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={closeMobileMenu}
            className="text-gray-light hover:text-white transition-colors lg:hidden"
            aria-label="Chiudi menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={closeMobileMenu}
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
      <main className="flex-1 overflow-y-auto p-4 pt-16 lg:p-8 lg:pt-8">
        <Outlet />
      </main>
    </div>
  )
}
