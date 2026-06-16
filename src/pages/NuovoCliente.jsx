import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useClienti } from '../hooks/useClienti'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getMarcheOrdered, getModelliPerMarca } from '../utils/motoDatabase'

export default function NuovoCliente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { aggiungiCliente, aggiornaCliente } = useClienti()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    cognome: '',
    telefono: '',
    email: '',
    codice_fiscale: '',
    indirizzo: '',
    note: '',
    veicoli: [{ targa: '', marca: '', modello: '', km: '' }],
  })

  useEffect(() => {
    if (id) {
      getDoc(doc(db, 'clienti', id)).then(snap => {
        if (snap.exists()) {
          const data = snap.data()
          setForm({
            nome: data.nome || '',
            cognome: data.cognome || '',
            telefono: data.telefono || '',
            email: data.email || '',
            codice_fiscale: data.codice_fiscale || '',
            indirizzo: data.indirizzo || '',
            note: data.note || '',
            veicoli: data.veicoli?.length > 0 ? data.veicoli.map(v => ({ targa: v.targa || '', marca: v.marca || '', modello: v.modello || '', km: v.km || '' })) : [{ targa: '', marca: '', modello: '', km: '' }],
          })
        }
      })
    }
  }, [id])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleVeicoloChange = (index, field, value) => {
    setForm(prev => {
      const veicoli = [...prev.veicoli]
      veicoli[index] = { ...veicoli[index], [field]: value }
      return { ...prev, veicoli }
    })
  }

  const aggiungiVeicolo = () => {
    setForm(prev => ({ ...prev, veicoli: [...prev.veicoli, { targa: '', marca: '', modello: '', km: '' }] }))
  }

  const rimuoviVeicolo = (index) => {
    setForm(prev => ({ ...prev, veicoli: prev.veicoli.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        ...form,
        veicoli: form.veicoli.filter(v => v.targa || v.marca || v.modello),
      }
      if (id) {
        await aggiornaCliente(id, data)
      } else {
        await aggiungiCliente(data)
      }
      navigate('/clienti')
    } catch (err) {
      console.error('Errore salvataggio cliente:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Link to="/clienti" className="flex items-center gap-2 text-gray-light hover:text-white mb-6">
        <ArrowLeft size={20} />
        Torna ai clienti
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold mb-8">{id ? 'Modifica Cliente' : 'Nuovo Cliente'}</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-light mb-1">Nome *</label>
            <input name="nome" value={form.nome} onChange={handleChange} required className="w-full px-4 py-3 bg-dark-light border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm text-gray-light mb-1">Cognome *</label>
            <input name="cognome" value={form.cognome} onChange={handleChange} required className="w-full px-4 py-3 bg-dark-light border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-light mb-1">Telefono *</label>
            <input name="telefono" value={form.telefono} onChange={handleChange} required className="w-full px-4 py-3 bg-dark-light border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm text-gray-light mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full px-4 py-3 bg-dark-light border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-light mb-1">Codice Fiscale</label>
            <input name="codice_fiscale" value={form.codice_fiscale} onChange={handleChange} className="w-full px-4 py-3 bg-dark-light border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm text-gray-light mb-1">Indirizzo</label>
            <input name="indirizzo" value={form.indirizzo} onChange={handleChange} className="w-full px-4 py-3 bg-dark-light border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-light mb-1">Note</label>
          <textarea name="note" value={form.note} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-dark-light border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary resize-none" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Veicoli</h3>
            <button type="button" onClick={aggiungiVeicolo} className="flex items-center gap-1 text-primary text-sm hover:underline">
              <Plus size={16} /> Aggiungi veicolo
            </button>
          </div>
          <div className="space-y-3">
            {form.veicoli.map((v, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-3 items-start">
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <input placeholder="Targa" value={v.targa} onChange={e => handleVeicoloChange(i, 'targa', e.target.value.toUpperCase())} className="px-3 py-2 bg-dark-light border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary text-sm" />
                  <div>
                    <input
                      list={`marca-veicolo-${i}`}
                      placeholder="Marca"
                      value={v.marca || ''}
                      onChange={e => handleVeicoloChange(i, 'marca', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-light border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary text-sm"
                    />
                    <datalist id={`marca-veicolo-${i}`}>
                      {getMarcheOrdered().map(m => <option key={m} value={m} />)}
                    </datalist>
                  </div>
                  <div>
                    <input
                      list={`modello-veicolo-${i}`}
                      placeholder="Modello"
                      value={v.modello || ''}
                      onChange={e => handleVeicoloChange(i, 'modello', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-light border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary text-sm"
                    />
                    <datalist id={`modello-veicolo-${i}`}>
                      {(v.marca ? getModelliPerMarca(v.marca) : []).map(m => <option key={m} value={m} />)}
                    </datalist>
                  </div>
                  <input placeholder="KM" type="number" value={v.km} onChange={e => handleVeicoloChange(i, 'km', e.target.value)} className="px-3 py-2 bg-dark-light border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary text-sm" />
                </div>
                {form.veicoli.length > 1 && (
                  <button type="button" onClick={() => rimuoviVeicolo(i)} className="p-2 text-danger hover:bg-dark-lighter rounded-lg">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Salvataggio...' : (id ? 'Salva Modifiche' : 'Crea Cliente')}
        </button>
      </form>
    </div>
  )
}
