import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useSchede } from '../hooks/useSchede'
import { useClienti } from '../hooks/useClienti'
import { ArrowLeft, Edit, Trash2, Phone, Mail, MapPin, Wrench, MessageCircle, Plus } from 'lucide-react'
import { formatValuta, formatData } from '../utils/formatters'
import { inviaMessaggioRitiro } from '../utils/whatsapp'

const badgePagamento = (metodo) => {
  const map = {
    contanti: { label: 'Contanti', cls: 'bg-success/20 text-success' },
    carta: { label: 'Carta', cls: 'bg-blue-500/20 text-blue-400' },
    fattura: { label: 'Fattura', cls: 'bg-purple-500/20 text-purple-400' },
    bonifico: { label: 'Bonifico', cls: 'bg-warning/20 text-warning' },
    non_pagato: { label: 'Non pagato', cls: 'bg-danger/20 text-danger' },
  }
  const info = map[metodo]
  if (!info) return null
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs ${info.cls}`}>
      {info.label}
    </span>
  )
}

export default function ClienteDettaglio() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { eliminaCliente } = useClienti()
  const { schede, loading: schedeLoading } = useSchede(id)
  const [cliente, setCliente] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDoc(doc(db, 'clienti', id)).then(snap => {
      if (snap.exists()) {
        setCliente({ id: snap.id, ...snap.data() })
      }
      setLoading(false)
    })
  }, [id])

  const handleElimina = async () => {
    if (window.confirm('Sei sicuro di voler eliminare questo cliente?')) {
      await eliminaCliente(id)
      navigate('/clienti')
    }
  }

  if (loading) return <div className="text-gray-light">Caricamento...</div>
  if (!cliente) return <div className="text-gray-light">Cliente non trovato</div>

  return (
    <div>
      <Link to="/clienti" className="flex items-center gap-2 text-gray-light hover:text-white mb-6">
        <ArrowLeft size={20} /> Torna ai clienti
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{cliente.nome} {cliente.cognome}</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-gray-light">
            {cliente.telefono && <span className="flex items-center gap-1"><Phone size={14} /> {cliente.telefono}</span>}
            {cliente.email && <span className="flex items-center gap-1"><Mail size={14} /> {cliente.email}</span>}
            {cliente.indirizzo && <span className="flex items-center gap-1"><MapPin size={14} /> {cliente.indirizzo}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/clienti/${id}/modifica`} className="flex items-center gap-2 px-4 py-2 bg-dark-lighter text-white rounded-lg hover:bg-dark-light transition-colors">
            <Edit size={16} /> Modifica
          </Link>
          <button onClick={handleElimina} className="flex items-center gap-2 px-4 py-2 bg-danger/20 text-danger rounded-lg hover:bg-danger/30 transition-colors">
            <Trash2 size={16} /> Elimina
          </button>
        </div>
      </div>

      {/* Veicoli */}
      {cliente.veicoli && cliente.veicoli.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Veicoli</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cliente.veicoli.map((v, i) => (
              <div key={i} className="bg-dark-light border border-dark-lighter rounded-xl p-4">
                <p className="font-bold text-lg">{v.targa}</p>
                <p className="text-gray-light">{v.modello}</p>
                {v.km && <p className="text-sm text-gray mt-1">{v.km} km</p>}
                <div className="flex flex-wrap gap-2 mt-3">
                  <a
                    href={inviaMessaggioRitiro(cliente.telefono, cliente.nome, v.modello)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-success/20 text-success rounded-lg text-sm hover:bg-success/30"
                  >
                    <MessageCircle size={14} /> Avvisa ritiro
                  </a>
                  <Link
                    to={`/schede/nuova?cliente=${id}&targa=${v.targa}&modello=${v.modello}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30"
                  >
                    <Wrench size={14} /> Nuova scheda
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Storico lavori */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold">Storico Lavori</h2>
          <Link
            to={`/schede/nuova?cliente=${id}`}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark"
          >
            <Plus size={16} /> Nuova Scheda
          </Link>
        </div>
        {schedeLoading ? (
          <p className="text-gray-light">Caricamento...</p>
        ) : schede.length === 0 ? (
          <p className="text-gray-light">Nessun lavoro registrato per questo cliente</p>
        ) : (
          <div className="space-y-3">
            {schede.map(scheda => (
              <Link
                key={scheda.id}
                to={`/schede/${scheda.id}`}
                className="flex items-center justify-between p-4 bg-dark-light border border-dark-lighter rounded-xl hover:border-primary/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{scheda.targa || 'N/D'} — {scheda.modello_veicolo || ''}</p>
                  <p className="text-sm text-gray-light">{formatData(scheda.data)}</p>
                  {scheda.note_tecniche && <p className="text-xs text-gray mt-1">{scheda.note_tecniche}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatValuta(scheda.totale || 0)}</p>
                  <div className="flex items-center gap-1.5 mt-1 justify-end flex-wrap">
                    <p className={`text-xs ${scheda.stato === 'completato' ? 'text-success' : scheda.stato === 'preventivo' ? 'text-warning' : 'text-gray-light'}`}>
                      {scheda.stato || 'in lavorazione'}
                    </p>
                    {badgePagamento(scheda.metodo_pagamento)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
