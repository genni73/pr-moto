import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { db } from '../firebase'
import { doc, getDoc, collection, getDocs, Timestamp } from 'firebase/firestore'
import { useSchede } from '../hooks/useSchede'
import { ArrowLeft, Plus, Trash2, FileText, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatValuta } from '../utils/formatters'
import { inviaPreventivo } from '../utils/whatsapp'
import { generaPDF } from '../utils/pdf'

export default function NuovaScheda() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { aggiungiScheda, aggiornaScheda } = useSchede()
  const [loading, setLoading] = useState(false)
  const [clienti, setClienti] = useState([])
  const [form, setForm] = useState({
    cliente_id: searchParams.get('cliente') || '',
    cliente_nome: '',
    cliente_telefono: '',
    targa: searchParams.get('targa') || '',
    modello_veicolo: searchParams.get('modello') || '',
    km: '',
    data: new Date().toISOString().split('T')[0],
    ricambi: [{ descrizione: '', prezzo: '' }],
    manodopera: '',
    note_tecniche: '',
    prossima_scadenza: '',
    stato: 'in_lavorazione',
  })

  useEffect(() => {
    getDocs(collection(db, 'clienti')).then(snap => {
      setClienti(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [])

  useEffect(() => {
    if (id) {
      getDoc(doc(db, 'schede_lavoro', id)).then(snap => {
        if (snap.exists()) {
          const data = snap.data()
          setForm({
            cliente_id: data.cliente_id || '',
            cliente_nome: data.cliente_nome || '',
            cliente_telefono: data.cliente_telefono || '',
            targa: data.targa || '',
            modello_veicolo: data.modello_veicolo || '',
            km: data.km || '',
            data: data.data?.toDate ? data.data.toDate().toISOString().split('T')[0] : data.data || '',
            ricambi: data.ricambi?.length > 0 ? data.ricambi : [{ descrizione: '', prezzo: '' }],
            manodopera: data.manodopera || '',
            note_tecniche: data.note_tecniche || '',
            prossima_scadenza: data.prossima_scadenza?.toDate ? data.prossima_scadenza.toDate().toISOString().split('T')[0] : data.prossima_scadenza || '',
            stato: data.stato || 'in_lavorazione',
          })
        }
      })
    }
  }, [id])

  useEffect(() => {
    if (form.cliente_id) {
      const cliente = clienti.find(c => c.id === form.cliente_id)
      if (cliente) {
        setForm(prev => ({
          ...prev,
          cliente_nome: `${cliente.nome} ${cliente.cognome}`,
          cliente_telefono: cliente.telefono || '',
        }))
      }
    }
  }, [form.cliente_id, clienti])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleRicambioChange = (index, field, value) => {
    setForm(prev => {
      const ricambi = [...prev.ricambi]
      ricambi[index] = { ...ricambi[index], [field]: value }
      return { ...prev, ricambi }
    })
  }

  const aggiungiRicambio = () => {
    setForm(prev => ({ ...prev, ricambi: [...prev.ricambi, { descrizione: '', prezzo: '' }] }))
  }

  const rimuoviRicambio = (index) => {
    setForm(prev => ({ ...prev, ricambi: prev.ricambi.filter((_, i) => i !== index) }))
  }

  const totaleRicambi = form.ricambi.reduce((sum, r) => sum + (parseFloat(r.prezzo) || 0), 0)
  const totale = totaleRicambi + (parseFloat(form.manodopera) || 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        ...form,
        ricambi: form.ricambi.filter(r => r.descrizione || r.prezzo),
        manodopera: parseFloat(form.manodopera) || 0,
        totale,
        data: Timestamp.fromDate(new Date(form.data)),
        prossima_scadenza: form.prossima_scadenza ? Timestamp.fromDate(new Date(form.prossima_scadenza)) : null,
      }
      if (id) {
        await aggiornaScheda(id, data)
      } else {
        await aggiungiScheda(data)
      }
      navigate('/schede')
    } catch (err) {
      console.error('Errore salvataggio scheda:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePDF = () => {
    generaPDF({ ...form, totale })
  }

  const handleWhatsApp = () => {
    if (form.cliente_telefono) {
      const link = inviaPreventivo(form.cliente_telefono, form.cliente_nome, form.modello_veicolo, totale)
      window.open(link, '_blank')
    }
  }

  return (
    <div>
      <Link to="/schede" className="flex items-center gap-2 text-gray-light hover:text-white mb-6">
        <ArrowLeft size={20} /> Torna alle schede
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{id ? 'Modifica Scheda' : 'Nuova Scheda Lavoro'}</h1>
        {id && (
          <div className="flex gap-2">
            <button onClick={handlePDF} className="flex items-center gap-2 px-4 py-2 bg-dark-lighter text-white rounded-lg hover:bg-dark-light">
              <FileText size={16} /> PDF
            </button>
            <button onClick={handleWhatsApp} className="flex items-center gap-2 px-4 py-2 bg-success/20 text-success rounded-lg hover:bg-success/30">
              <MessageCircle size={16} /> WhatsApp
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Cliente e Veicolo */}
        <div className="bg-dark-light border border-dark-lighter rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg border-b border-dark-lighter pb-2">Cliente e Veicolo</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-light mb-1">Cliente *</label>
              <select name="cliente_id" value={form.cliente_id} onChange={handleChange} required className="w-full px-4 py-3 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary">
                <option value="">Seleziona cliente</option>
                {clienti.map(c => (
                  <option key={c.id} value={c.id}>{c.nome} {c.cognome} {c.veicoli?.[0]?.targa ? `(${c.veicoli[0].targa})` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-light mb-1">Targa *</label>
              <input name="targa" value={form.targa} onChange={handleChange} required className="w-full px-4 py-3 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-light mb-1">Modello Veicolo</label>
              <input name="modello_veicolo" value={form.modello_veicolo} onChange={handleChange} className="w-full px-4 py-3 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm text-gray-light mb-1">KM</label>
              <input name="km" type="number" value={form.km} onChange={handleChange} className="w-full px-4 py-3 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm text-gray-light mb-1">Data *</label>
              <input name="data" type="date" value={form.data} onChange={handleChange} required className="w-full px-4 py-3 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-light mb-1">Stato</label>
            <select name="stato" value={form.stato} onChange={handleChange} className="w-full px-4 py-3 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary">
              <option value="preventivo">Preventivo</option>
              <option value="in_lavorazione">In Lavorazione</option>
              <option value="completato">Completato</option>
              <option value="consegnato">Consegnato</option>
            </select>
          </div>
        </div>

        {/* Ricambi */}
        <div className="bg-dark-light border border-dark-lighter rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Dettaglio Ricambi e Materiali</h3>
            <button type="button" onClick={aggiungiRicambio} className="flex items-center gap-1 text-primary text-sm hover:underline">
              <Plus size={16} /> Aggiungi riga
            </button>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_120px_40px] gap-3 text-sm text-gray-light px-1">
              <span>Descrizione</span>
              <span>Prezzo (&euro;)</span>
              <span></span>
            </div>
            {form.ricambi.map((r, i) => (
              <div key={i} className="grid grid-cols-[1fr_120px_40px] gap-3">
                <input placeholder="Es: Olio motore 10W40" value={r.descrizione} onChange={e => handleRicambioChange(i, 'descrizione', e.target.value)} className="px-3 py-2 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary text-sm" />
                <input type="number" step="0.01" placeholder="0.00" value={r.prezzo} onChange={e => handleRicambioChange(i, 'prezzo', e.target.value)} className="px-3 py-2 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary text-sm text-right" />
                {form.ricambi.length > 1 && (
                  <button type="button" onClick={() => rimuoviRicambio(i)} className="p-2 text-danger hover:bg-dark-lighter rounded-lg">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-dark-lighter">
            <div className="grid grid-cols-[1fr_120px_40px] gap-3">
              <label className="text-sm text-gray-light self-center">Manodopera</label>
              <input name="manodopera" type="number" step="0.01" placeholder="0.00" value={form.manodopera} onChange={handleChange} className="px-3 py-2 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary text-sm text-right" />
              <span></span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-dark-lighter flex justify-between items-center">
            <span className="text-lg font-semibold">TOTALE LAVORO</span>
            <span className="text-2xl font-bold text-primary">{formatValuta(totale)}</span>
          </div>
        </div>

        {/* Note */}
        <div className="bg-dark-light border border-dark-lighter rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg border-b border-dark-lighter pb-2">Note Tecniche / Prossima Scadenza</h3>
          <div>
            <label className="block text-sm text-gray-light mb-1">Note Tecniche</label>
            <textarea name="note_tecniche" value={form.note_tecniche} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary resize-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-light mb-1">Prossima Scadenza</label>
            <input name="prossima_scadenza" type="date" value={form.prossima_scadenza} onChange={handleChange} className="w-full px-4 py-3 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Salvataggio...' : (id ? 'Salva Modifiche' : 'Crea Scheda')}
        </button>
      </form>
    </div>
  )
}
