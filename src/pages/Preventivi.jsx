import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSchede } from '../hooks/useSchede'
import { MessageCircle, FileText, CheckCircle, Search } from 'lucide-react'
import { formatValuta, formatData } from '../utils/formatters'
import { inviaPreventivo } from '../utils/whatsapp'
import { generaPDF } from '../utils/pdf'

export default function Preventivi() {
  const { schede, loading, aggiornaScheda } = useSchede()
  const [ricerca, setRicerca] = useState('')
  const [filtro, setFiltro] = useState('preventivo')

  const preventivi = schede.filter(s => {
    const matchStato = filtro === 'tutti' || s.stato === filtro
    const termine = ricerca.toLowerCase()
    const matchRicerca = !ricerca ||
      (s.cliente_nome || '').toLowerCase().includes(termine) ||
      (s.targa || '').toLowerCase().includes(termine)
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
    generaPDF({
      ...scheda,
      data: scheda.data?.toDate ? scheda.data.toDate().toISOString().split('T')[0] : scheda.data,
      prossima_scadenza: scheda.prossima_scadenza?.toDate ? scheda.prossima_scadenza.toDate().toISOString().split('T')[0] : scheda.prossima_scadenza,
    })
  }

  if (loading) return <div className="text-gray-light">Caricamento preventivi...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Preventivi</h1>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray" size={20} />
          <input
            type="text"
            placeholder="Cerca per cliente o targa..."
            value={ricerca}
            onChange={e => setRicerca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-dark-light border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          className="px-4 py-3 bg-dark-light border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary"
        >
          <option value="preventivo">In Attesa</option>
          <option value="in_lavorazione">Approvati</option>
          <option value="tutti">Tutti</option>
        </select>
      </div>

      {preventivi.length === 0 ? (
        <div className="text-center py-12 text-gray-light">Nessun preventivo trovato</div>
      ) : (
        <div className="space-y-4">
          {preventivi.map(scheda => (
            <div key={scheda.id} className="bg-dark-light border border-dark-lighter rounded-xl p-6">
              <div className="flex items-start justify-between">
                <Link to={`/schede/${scheda.id}`} className="hover:text-primary">
                  <p className="font-semibold text-lg">{scheda.cliente_nome || 'Cliente'}</p>
                  <p className="text-gray-light">{scheda.targa} — {scheda.modello_veicolo}</p>
                  <p className="text-sm text-gray mt-1">{formatData(scheda.data)}</p>
                </Link>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{formatValuta(scheda.totale || 0)}</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                    scheda.stato === 'preventivo' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                  }`}>
                    {scheda.stato === 'preventivo' ? 'In attesa' : 'Approvato'}
                  </span>
                </div>
              </div>

              {/* Riepilogo ricambi */}
              {scheda.ricambi && scheda.ricambi.length > 0 && (
                <div className="mt-4 pt-4 border-t border-dark-lighter">
                  <div className="space-y-1 text-sm">
                    {scheda.ricambi.filter(r => r.descrizione).map((r, i) => (
                      <div key={i} className="flex justify-between text-gray-light">
                        <span>{r.descrizione}</span>
                        <span>{formatValuta(parseFloat(r.prezzo) || 0)}</span>
                      </div>
                    ))}
                    {scheda.manodopera > 0 && (
                      <div className="flex justify-between text-gray-light">
                        <span>Manodopera</span>
                        <span>{formatValuta(scheda.manodopera)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-4 border-t border-dark-lighter">
                <button onClick={() => handleWhatsApp(scheda)} className="flex items-center gap-2 px-3 py-2 bg-success/20 text-success rounded-lg text-sm hover:bg-success/30">
                  <MessageCircle size={16} /> Invia WhatsApp
                </button>
                <button onClick={() => handlePDF(scheda)} className="flex items-center gap-2 px-3 py-2 bg-dark-lighter text-white rounded-lg text-sm hover:bg-dark">
                  <FileText size={16} /> Scarica PDF
                </button>
                {scheda.stato === 'preventivo' && (
                  <button onClick={() => handleApprova(scheda)} className="flex items-center gap-2 px-3 py-2 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 ml-auto">
                    <CheckCircle size={16} /> Approva
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