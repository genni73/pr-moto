import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore'
import { Users, Wrench, FileText, Euro, AlertTriangle, TrendingUp } from 'lucide-react'
import { formatValuta, formatData } from '../utils/formatters'
import { Link } from 'react-router-dom'

function StatCard({ icon: Icon, label, value, color = 'text-primary' }) {
  return (
    <div className="bg-dark-light rounded-xl p-6 border border-dark-lighter">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-dark-lighter ${color}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-gray-light text-sm">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totaleClienti: 0,
    schedeMese: 0,
    fatturatoMese: 0,
    preventiviInAttesa: 0,
    scadenzeVicine: 0,
  })
  const [ultimeSchede, setUltimeSchede] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const clientiSnap = await getDocs(collection(db, 'clienti'))
        const totaleClienti = clientiSnap.size

        const inizioMese = new Date()
        inizioMese.setDate(1)
        inizioMese.setHours(0, 0, 0, 0)
        const tsInizioMese = Timestamp.fromDate(inizioMese)

        const schedeMeseQ = query(
          collection(db, 'schede_lavoro'),
          where('data', '>=', tsInizioMese)
        )
        const schedeMeseSnap = await getDocs(schedeMeseQ)
        const schedeMese = schedeMeseSnap.size
        let fatturatoMese = 0
        schedeMeseSnap.forEach(doc => {
          fatturatoMese += doc.data().totale || 0
        })

        const preventiviQ = query(
          collection(db, 'schede_lavoro'),
          where('stato', '==', 'preventivo')
        )
        const preventiviSnap = await getDocs(preventiviQ)

        const tra30giorni = new Date()
        tra30giorni.setDate(tra30giorni.getDate() + 30)
        const tsTra30 = Timestamp.fromDate(tra30giorni)
        const oggi = Timestamp.fromDate(new Date())

        let scadenzeVicine = 0
        const tutteSchede = await getDocs(collection(db, 'schede_lavoro'))
        tutteSchede.forEach(doc => {
          const d = doc.data()
          if (d.prossima_scadenza && d.prossima_scadenza >= oggi && d.prossima_scadenza <= tsTra30) {
            scadenzeVicine++
          }
        })

        setStats({
          totaleClienti,
          schedeMese,
          fatturatoMese,
          preventiviInAttesa: preventiviSnap.size,
          scadenzeVicine,
        })

        const ultimeQ = query(
          collection(db, 'schede_lavoro'),
          orderBy('data', 'desc'),
          limit(5)
        )
        const ultimeSnap = await getDocs(ultimeQ)
        setUltimeSchede(ultimeSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error('Errore caricamento dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return <div className="text-gray-light">Caricamento dashboard...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard icon={Users} label="Clienti Totali" value={stats.totaleClienti} />
        <StatCard icon={Wrench} label="Lavori Questo Mese" value={stats.schedeMese} color="text-success" />
        <StatCard icon={Euro} label="Fatturato Mese" value={formatValuta(stats.fatturatoMese)} color="text-success" />
        <StatCard icon={FileText} label="Preventivi in Attesa" value={stats.preventiviInAttesa} color="text-warning" />
        <StatCard icon={AlertTriangle} label="Scadenze Prossime 30gg" value={stats.scadenzeVicine} color="text-warning" />
        <StatCard icon={TrendingUp} label="Media per Lavoro" value={stats.schedeMese > 0 ? formatValuta(stats.fatturatoMese / stats.schedeMese) : '€ 0,00'} color="text-primary" />
      </div>

      <div className="bg-dark-light rounded-xl border border-dark-lighter p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Ultimi Lavori</h2>
          <Link to="/schede" className="text-primary text-sm hover:underline">Vedi tutti &rarr;</Link>
        </div>
        {ultimeSchede.length === 0 ? (
          <p className="text-gray-light">Nessun lavoro registrato</p>
        ) : (
          <div className="space-y-3">
            {ultimeSchede.map(scheda => (
              <Link
                key={scheda.id}
                to={`/schede/${scheda.id}`}
                className="flex items-center justify-between p-4 bg-dark-lighter rounded-lg hover:bg-dark transition-colors"
              >
                <div>
                  <p className="font-medium">{scheda.cliente_nome || 'Cliente'} &mdash; {scheda.targa || 'N/D'}</p>
                  <p className="text-sm text-gray-light">{scheda.modello_veicolo || ''} &bull; {formatData(scheda.data)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatValuta(scheda.totale || 0)}</p>
                  <p className={`text-xs ${scheda.stato === 'completato' ? 'text-success' : scheda.stato === 'preventivo' ? 'text-warning' : 'text-gray-light'}`}>
                    {scheda.stato || 'in lavorazione'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
