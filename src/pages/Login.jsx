import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errore, setErrore] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrore('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/')
    } catch {
      setErrore('Email o password non validi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="bg-dark-light rounded-2xl p-8 w-full max-w-md border border-dark-lighter">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary italic">P.R. MOTO</h1>
          <p className="text-gray-light mt-2">Vendita Moto e Assistenza</p>
          <p className="text-xs text-gray mt-1">Via Benedetto Croce, 13/15 - Acerra (NA)</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-light mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-light mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary"
              required
            />
          </div>
          {errore && <p className="text-danger text-sm">{errore}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Accesso...' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  )
}
