import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter } from 'lucide-react'
import { useSchede } from '../hooks/useSchede'
import { formatValuta, formatData } from '../utils/formatters'

export default function SchedaLavoro() {
  const { schede, loading } = useSchede()
  const [ricerca, setRicerca] = useState('')
  const [filtroStato, setFiltroStato] = useState('tutti')

  const filtrate = schede.filter(s => {
    const termine = ricerca.toLowerCase()
    const matchRicerca = !ricerca ||
      (s.cliente_nome || '').toLowerCase().includes(termine) ||
      (s.targa || '').toLowerCase().includes(termine) ||
      (s.modello_veicolo || '').toLowerCase().includes(termine)
    const matchStato = filtroStato === 'tutti' || s.stato === filtroStato
    return matchRicerca && matchStato
  })

  if (loading) return <div className="text-gray-light">Caricamento schede...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Schede Lavoro</h1>
        <Link
          to="/schede/nuova"
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          Nuova Scheda
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray" size={20} />
          <input
            type="text"
            placeholder="Cerca per cliente, targa o modello..."
            value={ricerca}
            onChange={e => setRicerca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-dark-light border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray" />
          <select
            value={filtroStato}
            onChange={e => setFiltroStato(e.target.value)}
            className="px-4 py-3 bg-dark-light border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary"
          >
            <option value="tutti">Tutti</option>
            <option value="in_lavorazione">In Lavorazione</option>
            <option value="completato">Completato</option>
            <option value="preventivo">Preventivo</option>
            <option value="consegnato">Consegnato</option>
          </select>
        </div>
      </div>

      {filtrate.length === 0 ? (
        <div className="text-center py-12 text-gray-light">
          {ricerca || filtroStato !== 'tutti' ? 'Nessuna scheda trovata' : 'Nessuna scheda registrata'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtrate.map(scheda => (
            <Link
              key={scheda.id}
              to={`/schede/${scheda.id}`}
              className="flex items-center justify-between p-4 bg-dark-light border border-dark-lighter rounded-xl hover:border-primary/50 transition-colors"
            >
              <div>
                <p className="font-semibold text-lg">{scheda.cliente_nome || 'Cliente'}</p>
                <p className="text-gray-light">{scheda.targa || 'N/D'} — {scheda.modello_veicolo || ''}</p>
                <p className="text-sm text-gray mt-1">{formatData(scheda.data)}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">{formatValuta(scheda.totale || 0)}</p>
                <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                  scheda.stato === 'completato' ? 'bg-success/20 text-success' :
                  scheda.stato === 'preventivo' ? 'bg-warning/20 text-warning' :
                  scheda.stato === 'consegnato' ? 'bg-primary/20 text-primary' :
                  'bg-dark-lighter text-gray-light'
                }`}>
                  {(scheda.stato || 'in lavorazione').replace('_', ' ')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
