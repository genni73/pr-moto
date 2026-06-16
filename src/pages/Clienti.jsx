import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Phone, Mail, ChevronRight } from 'lucide-react'
import { useClienti } from '../hooks/useClienti'

export default function Clienti() {
  const { clienti, loading } = useClienti()
  const [ricerca, setRicerca] = useState('')

  const filtrati = clienti.filter(c => {
    const termine = ricerca.toLowerCase()
    return (
      (c.nome || '').toLowerCase().includes(termine) ||
      (c.cognome || '').toLowerCase().includes(termine) ||
      (c.telefono || '').includes(termine) ||
      (c.veicoli || []).some(v => (v.targa || '').toLowerCase().includes(termine))
    )
  })

  if (loading) return <div className="text-gray-light">Caricamento clienti...</div>

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Clienti</h1>
        <Link
          to="/clienti/nuovo"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors w-full sm:w-auto"
        >
          <Plus size={20} />
          Nuovo Cliente
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray" size={20} />
        <input
          type="text"
          placeholder="Cerca per nome, cognome, telefono o targa..."
          value={ricerca}
          onChange={e => setRicerca(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-dark-light border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary"
        />
      </div>

      {filtrati.length === 0 ? (
        <div className="text-center py-12 text-gray-light">
          {ricerca ? 'Nessun cliente trovato' : 'Nessun cliente registrato. Aggiungi il primo!'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtrati.map(cliente => (
            <Link
              key={cliente.id}
              to={`/clienti/${cliente.id}`}
              className="flex items-center justify-between p-4 bg-dark-light border border-dark-lighter rounded-xl hover:border-primary/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base sm:text-lg">{cliente.nome} {cliente.cognome}</p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-sm text-gray-light">
                  {cliente.telefono && (
                    <span className="flex items-center gap-1"><Phone size={14} /> {cliente.telefono}</span>
                  )}
                  {cliente.email && (
                    <span className="flex items-center gap-1"><Mail size={14} /> {cliente.email}</span>
                  )}
                </div>
                {cliente.veicoli && cliente.veicoli.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {cliente.veicoli.map((v, i) => (
                      <span key={i} className="px-2 py-1 bg-dark-lighter rounded text-xs text-gray-light">
                        {v.targa} — {v.modello}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <ChevronRight size={20} className="text-gray" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
