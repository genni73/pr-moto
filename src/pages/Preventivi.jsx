import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSchede } from '../hooks/useSchede'
import { Plus, MessageCircle, FileText, CheckCircle, Search, Filter } from 'lucide-react'
import { formatValuta, formatData } from '../utils/formatters'
import { generaPreventivoPDF } from '../utils/pdf'
import { inviaPreventivo } from '../utils/whatsapp'

export default function Preventivi() {
  const { schede, loading, aggiornaScheda } = useSchede()
  const [ricerca, setRicerca] = useState('')
  const [filtro, setFiltro] = useState('preventivo')

  const preventivi = schede.filter(s => {
    const matchStato = filtro === 'tutti' || s.stato === filtro
    const termine = ricerca.toLowerCase()
    const matchRicerca = !ricerca ||
      (s.cliente_nome || '').toLowerCase().includes(termine) ||
      (s.targa || '').toLowerCase().includes(termine) ||
      (s.modello_veicolo || '').toLowerCase().includes(termine)
    return matchStato && matchRicerca
  })

  const handleApprova = async (scheda) => {
    await aggiornaScheda(scheda.id, { stato: 'in_lavorazione' })
  }

  const handleWhatsApp = (scheda) => {
    if (scheda.cliente_telefono) {
      const link = inviaPreventivo(scheda.cliente_telefono, scheda.cliente_nome, scheda.modello_veicolo, scheda.totale || 0)
      window.open(link, '_blank')
    }
  }

  const handlePDF = (scheda) => {
    generaPreventivoPDF({
      ...scheda,
      data: scheda.data?.toDate ? scheda.data.toDate().toISOString().split('T')[0] : scheda.data,
      prossima_scadenza: scheda.prossima_scadenza?.toDate ? scheda.prossima_scadenza.toDate().toISOString().split('T')[0] : scheda.prossima_scadenza,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header con titolo e bottone nuovo preventivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Preventivi</h1>
        <Link
          to="/schede/nuova?stato=preventivo"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Nuovo Preventivo
        </Link>
      </div>

      {/* Barra di ricerca e filtro */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray" size={18} />
          <input
            type="text"
            placeholder="Cerca per cliente, targa o modello..."
            value={ricerca}
            onChange={e => setRicerca(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-dark-light border border-dark-lighter rounded-xl text-white placeholder-gray focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray pointer-events-none" size={18} />
          <select
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            className="pl-10 pr-8 py-3 bg-dark-light border border-dark-lighter rounded-xl text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="preventivo">In Attesa</option>
            <option value="in_lavorazione">Approvati</option>
            <option value="tutti">Tutti</option>
          </select>
        </div>
      </div>

      {/* Stato vuoto */}
      {preventivi.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-dark-light flex items-center justify-center mb-4">
            <FileText size={28} className="text-gray" />
          </div>
          <p className="text-lg text-gray-light mb-2">Nessun preventivo trovato</p>
          <p className="text-sm text-gray mb-6">
            {ricerca
              ? 'Prova a modificare i criteri di ricerca'
              : 'Crea il tuo primo preventivo per iniziare'}
          </p>
          {!ricerca && (
            <Link
              to="/schede/nuova?stato=preventivo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Crea preventivo
            </Link>
          )}
        </div>
      ) : (
        /* Griglia preventivi: 1 colonna mobile, 2 colonne desktop */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {preventivi.map(scheda => (
            <div
              key={scheda.id}
              className="bg-dark-light border border-dark-lighter rounded-xl p-5 sm:p-6 hover:border-dark-lighter/80 transition-colors"
            >
              {/* Intestazione card: info cliente + totale e badge */}
              <div className="flex items-start justify-between gap-4">
                <Link to={`/schede/${scheda.id}`} className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
                  <p className="font-semibold text-lg text-white truncate">
                    {scheda.cliente_nome || 'Cliente'}
                  </p>
                  <p className="text-sm text-gray-light truncate">
                    {scheda.targa && <span className="font-mono uppercase">{scheda.targa}</span>}
                    {scheda.targa && scheda.modello_veicolo && ' — '}
                    {scheda.modello_veicolo}
                  </p>
                  <p className="text-xs text-gray mt-1">{formatData(scheda.data)}</p>
                </Link>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl sm:text-2xl font-bold text-primary">
                    {formatValuta(scheda.totale || 0)}
                  </p>
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium mt-1.5 ${
                      scheda.stato === 'preventivo'
                        ? 'bg-warning/15 text-warning'
                        : 'bg-success/15 text-success'
                    }`}
                  >
                    {scheda.stato === 'preventivo' ? 'In attesa' : 'Approvato'}
                  </span>
                </div>
              </div>

              {/* Elenco ricambi e manodopera */}
              {((scheda.ricambi && scheda.ricambi.length > 0) || scheda.manodopera > 0) && (
                <div className="mt-4 pt-4 border-t border-dark-lighter">
                  <div className="space-y-1.5 text-sm">
                    {scheda.ricambi?.filter(r => r.descrizione).map((r, i) => (
                      <div key={i} className="flex justify-between gap-2 text-gray-light">
                        <span className="truncate">{r.descrizione}</span>
                        <span className="flex-shrink-0 font-medium">
                          {formatValuta(parseFloat(r.prezzo) || 0)}
                        </span>
                      </div>
                    ))}
                    {scheda.manodopera > 0 && (
                      <div className="flex justify-between gap-2 text-gray-light">
                        <span>Manodopera</span>
                        <span className="flex-shrink-0 font-medium">
                          {formatValuta(scheda.manodopera)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Azioni */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-dark-lighter">
                <button
                  onClick={() => handleWhatsApp(scheda)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-success/15 text-success rounded-lg text-sm font-medium hover:bg-success/25 transition-colors"
                >
                  <MessageCircle size={16} />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
                <button
                  onClick={() => handlePDF(scheda)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-dark-lighter text-gray-light rounded-lg text-sm font-medium hover:bg-dark hover:text-white transition-colors"
                >
                  <FileText size={16} />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                {scheda.stato === 'preventivo' && (
                  <button
                    onClick={() => handleApprova(scheda)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-primary/15 text-primary rounded-lg text-sm font-medium hover:bg-primary/25 transition-colors ml-auto"
                  >
                    <CheckCircle size={16} />
                    Approva
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
