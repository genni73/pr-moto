import { useState } from 'react'
import { Save } from 'lucide-react'

export default function Impostazioni() {
  const [settings, setSettings] = useState({
    nome_officina: 'P.R. MOTO',
    sottotitolo: 'Vendita Moto e Assistenza',
    indirizzo: 'Via Benedetto Croce, 13/15 - Acerra (NA)',
    telefono: '333 95 41 524',
    email: '',
    partita_iva: '',
    messaggio_ritiro: 'Gentile {nome}, la informiamo che la sua {veicolo} è pronta per il ritiro presso P.R. MOTO.',
    messaggio_preventivo: 'Gentile {nome}, ecco il preventivo per la sua {veicolo}: Totale: €{totale}',
    messaggio_promemoria: 'Gentile {nome}, le ricordiamo la manutenzione prevista: {scadenza}.',
  })
  const [salvato, setSalvato] = useState(false)

  const handleChange = (e) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSalvato(false)
  }

  const handleSalva = () => {
    localStorage.setItem('pr_moto_settings', JSON.stringify(settings))
    setSalvato(true)
    setTimeout(() => setSalvato(false), 3000)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Impostazioni</h1>

      <div className="max-w-2xl space-y-8">
        <div className="bg-dark-light border border-dark-lighter rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b border-dark-lighter pb-2">Dati Officina</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-light mb-1">Nome Officina</label>
              <input name="nome_officina" value={settings.nome_officina} onChange={handleChange} className="w-full px-4 py-3 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm text-gray-light mb-1">Sottotitolo</label>
              <input name="sottotitolo" value={settings.sottotitolo} onChange={handleChange} className="w-full px-4 py-3 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-light mb-1">Indirizzo</label>
            <input name="indirizzo" value={settings.indirizzo} onChange={handleChange} className="w-full px-4 py-3 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-light mb-1">Telefono</label>
              <input name="telefono" value={settings.telefono} onChange={handleChange} className="w-full px-4 py-3 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm text-gray-light mb-1">Email</label>
              <input name="email" value={settings.email} onChange={handleChange} className="w-full px-4 py-3 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-light mb-1">Partita IVA</label>
            <input name="partita_iva" value={settings.partita_iva} onChange={handleChange} className="w-full px-4 py-3 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary" />
          </div>
        </div>

        <div className="bg-dark-light border border-dark-lighter rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b border-dark-lighter pb-2">Messaggi WhatsApp</h2>
          <p className="text-xs text-gray-light">Variabili disponibili: {'{nome}'}, {'{veicolo}'}, {'{totale}'}, {'{scadenza}'}</p>
          <div>
            <label className="block text-sm text-gray-light mb-1">Messaggio Ritiro</label>
            <textarea name="messaggio_ritiro" value={settings.messaggio_ritiro} onChange={handleChange} rows={2} className="w-full px-4 py-3 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary resize-none text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-light mb-1">Messaggio Preventivo</label>
            <textarea name="messaggio_preventivo" value={settings.messaggio_preventivo} onChange={handleChange} rows={2} className="w-full px-4 py-3 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary resize-none text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-light mb-1">Messaggio Promemoria Scadenza</label>
            <textarea name="messaggio_promemoria" value={settings.messaggio_promemoria} onChange={handleChange} rows={2} className="w-full px-4 py-3 bg-dark-lighter border border-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary resize-none text-sm" />
          </div>
        </div>

        <button onClick={handleSalva} className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors">
          <Save size={20} />
          {salvato ? 'Salvato ✓' : 'Salva Impostazioni'}
        </button>
      </div>
    </div>
  )
}