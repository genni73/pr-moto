import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clienti from './pages/Clienti'
import ClienteDettaglio from './pages/ClienteDettaglio'
import NuovoCliente from './pages/NuovoCliente'
import SchedaLavoro from './pages/SchedaLavoro'
import NuovaScheda from './pages/NuovaScheda'
import Preventivi from './pages/Preventivi'
import Impostazioni from './pages/Impostazioni'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen bg-dark"><div className="text-white">Caricamento...</div></div>
  if (!user) return <Navigate to="/login" />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="clienti" element={<Clienti />} />
        <Route path="clienti/nuovo" element={<NuovoCliente />} />
        <Route path="clienti/:id" element={<ClienteDettaglio />} />
        <Route path="clienti/:id/modifica" element={<NuovoCliente />} />
        <Route path="schede" element={<SchedaLavoro />} />
        <Route path="schede/nuova" element={<NuovaScheda />} />
        <Route path="schede/:id" element={<NuovaScheda />} />
        <Route path="preventivi" element={<Preventivi />} />
        <Route path="impostazioni" element={<Impostazioni />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
