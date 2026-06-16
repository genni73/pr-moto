import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore'
import { Users, Wrench, FileText, Euro, AlertTriangle, TrendingUp, Calendar, Wallet, AlertCircle, CreditCard, Banknote, Receipt, Building2 } from 'lucide-react'
import { formatValuta, formatData } from '../utils/formatters'
import { Link } from 'react-router-dom'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

function StatCard({ icon: Icon, label, value, color = 'text-primary' }) {
  return (
    <div className="bg-dark-light rounded-xl p-5 sm:p-6 border border-dark-lighter hover:border-gray-700 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-dark-lighter ${color}`}>
          <Icon size={24} />
        </div>
        <div className="min-w-0">
          <p className="text-gray-light text-sm truncate">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

function getLastSixMonths() {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      label: d.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' }),
      start: d,
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999),
    })
  }
  return months
}

const STATO_COLORS = {
  completato: '#22c55e',
  'in lavorazione': '#3b82f6',
  in_lavorazione: '#3b82f6',
  preventivo: '#eab308',
  annullato: '#ef4444',
  consegnato: '#8b5cf6',
}

const STATO_LABELS = {
  completato: 'Completato',
  'in lavorazione': 'In Lavorazione',
  in_lavorazione: 'In Lavorazione',
  preventivo: 'Preventivo',
  annullato: 'Annullato',
  consegnato: 'Consegnato',
}

const METODO_COLORS = {
  contanti: '#22c55e',
  carta: '#3b82f6',
  fattura: '#8b5cf6',
  bonifico: '#f59e0b',
  non_pagato: '#ef4444',
}

const METODO_LABELS = {
  contanti: 'Contanti',
  carta: 'Carta',
  fattura: 'Fattura',
  bonifico: 'Bonifico',
  non_pagato: 'Non Pagato',
}

const METODO_ICONS = {
  contanti: Banknote,
  carta: CreditCard,
  fattura: Receipt,
  bonifico: Building2,
  non_pagato: AlertCircle,
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totaleClienti: 0,
    schedeMese: 0,
    fatturatoMese: 0,
    preventiviInAttesa: 0,
    scadenzeVicine: 0,
    mediaPerLavoro: 0,
    incassatoMese: 0,
    nonPagati: 0,
  })
  const [ultimeSchede, setUltimeSchede] = useState([])
  const [scadenze, setScadenze] = useState([])
  const [monthlyRevenue, setMonthlyRevenue] = useState([])
  const [statoDistribution, setStatoDistribution] = useState({})
  const [pagamentiCount, setPagamentiCount] = useState({})
  const [pagamentiTotale, setPagamentiTotale] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch clienti
        const clientiSnap = await getDocs(collection(db, 'clienti'))
        const totaleClienti = clientiSnap.size

        // Fetch tutte le schede lavoro
        const tutteSchedeSnap = await getDocs(collection(db, 'schede_lavoro'))
        const tutteSchede = tutteSchedeSnap.docs.map(d => ({ id: d.id, ...d.data() }))

        // Inizio mese corrente
        const inizioMese = new Date()
        inizioMese.setDate(1)
        inizioMese.setHours(0, 0, 0, 0)
        const tsInizioMese = Timestamp.fromDate(inizioMese)

        // Stats mese corrente
        let schedeMese = 0
        let fatturatoMese = 0
        let incassatoMese = 0
        tutteSchede.forEach(s => {
          if (s.data && s.data >= tsInizioMese) {
            schedeMese++
            fatturatoMese += s.totale || 0
            if (s.stato === 'completato' || s.stato === 'consegnato') {
              incassatoMese += s.totale || 0
            }
          }
        })

        // Preventivi in attesa
        const preventiviInAttesa = tutteSchede.filter(s => s.stato === 'preventivo').length

        // Non pagati
        const nonPagati = tutteSchede.filter(s => !s.metodo_pagamento || s.metodo_pagamento === 'non_pagato').length

        // Scadenze prossimi 30 giorni
        const oggi = new Date()
        oggi.setHours(0, 0, 0, 0)
        const tra30giorni = new Date()
        tra30giorni.setDate(tra30giorni.getDate() + 30)
        const tsOggi = Timestamp.fromDate(oggi)
        const tsTra30 = Timestamp.fromDate(tra30giorni)

        const schedeConScadenza = tutteSchede.filter(s => {
          return s.prossima_scadenza && s.prossima_scadenza >= tsOggi && s.prossima_scadenza <= tsTra30
        })

        // Distribuzione stati
        const statiCount = {}
        tutteSchede.forEach(s => {
          const stato = s.stato || 'in lavorazione'
          statiCount[stato] = (statiCount[stato] || 0) + 1
        })
        setStatoDistribution(statiCount)

        // Distribuzione metodi di pagamento
        const pCount = {}
        const pTotale = {}
        tutteSchede.forEach(s => {
          const metodo = s.metodo_pagamento || 'non_pagato'
          pCount[metodo] = (pCount[metodo] || 0) + 1
          pTotale[metodo] = (pTotale[metodo] || 0) + (s.totale || 0)
        })
        setPagamentiCount(pCount)
        setPagamentiTotale(pTotale)

        // Fatturato ultimi 6 mesi
        const months = getLastSixMonths()
        const revenueByMonth = months.map(m => {
          let total = 0
          tutteSchede.forEach(s => {
            if (s.data) {
              const dataScheda = s.data.toDate ? s.data.toDate() : new Date(s.data)
              if (dataScheda >= m.start && dataScheda <= m.end) {
                total += s.totale || 0
              }
            }
          })
          return { label: m.label, total }
        })
        setMonthlyRevenue(revenueByMonth)

        // Media per lavoro (mese corrente)
        const mediaPerLavoro = schedeMese > 0 ? fatturatoMese / schedeMese : 0

        setStats({
          totaleClienti,
          schedeMese,
          fatturatoMese,
          preventiviInAttesa,
          scadenzeVicine: schedeConScadenza.length,
          mediaPerLavoro,
          incassatoMese,
          nonPagati,
        })

        // Scadenze ordinate per data
        const scadenzeOrdinate = schedeConScadenza
          .sort((a, b) => {
            const da = a.prossima_scadenza.toDate ? a.prossima_scadenza.toDate() : new Date(a.prossima_scadenza)
            const db2 = b.prossima_scadenza.toDate ? b.prossima_scadenza.toDate() : new Date(b.prossima_scadenza)
            return da - db2
          })
          .slice(0, 5)
        setScadenze(scadenzeOrdinate)

        // Ultime 5 schede
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
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-light text-lg">Caricamento dashboard...</div>
      </div>
    )
  }

  // Chart data - Fatturato mensile
  const barData = {
    labels: monthlyRevenue.map(m => m.label),
    datasets: [
      {
        label: 'Fatturato',
        data: monthlyRevenue.map(m => m.total),
        backgroundColor: 'rgba(220, 38, 38, 0.8)',
        borderColor: '#dc2626',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => formatValuta(ctx.parsed.y),
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#9ca3af' },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#9ca3af',
          callback: (val) => formatValuta(val),
        },
      },
    },
  }

  // Chart data - Stato lavori
  const statiKeys = Object.keys(statoDistribution)
  const doughnutData = {
    labels: statiKeys.map(k => STATO_LABELS[k] || k),
    datasets: [
      {
        data: statiKeys.map(k => statoDistribution[k]),
        backgroundColor: statiKeys.map(k => STATO_COLORS[k] || '#6b7280'),
        borderColor: '#1a1a1a',
        borderWidth: 3,
      },
    ],
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#d1d5db',
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
          font: { size: 12 },
        },
      },
    },
  }

  // Chart data - Metodi di pagamento
  const pagamentiKeys = Object.keys(pagamentiCount)
  const pagamentiDoughnutData = {
    labels: pagamentiKeys.map(k => METODO_LABELS[k] || k),
    datasets: [
      {
        data: pagamentiKeys.map(k => pagamentiCount[k]),
        backgroundColor: pagamentiKeys.map(k => METODO_COLORS[k] || '#6b7280'),
        borderColor: '#1a1a1a',
        borderWidth: 3,
      },
    ],
  }

  const pagamentiDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#d1d5db',
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
          font: { size: 12 },
        },
      },
    },
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard icon={Users} label="Clienti Totali" value={stats.totaleClienti} />
        <StatCard icon={Wrench} label="Lavori Questo Mese" value={stats.schedeMese} />
        <StatCard icon={Euro} label="Fatturato Mese" value={formatValuta(stats.fatturatoMese)} color="text-success" />
        <StatCard icon={FileText} label="Preventivi in Attesa" value={stats.preventiviInAttesa} color="text-warning" />
        <StatCard icon={AlertTriangle} label="Scadenze Prossime 30gg" value={stats.scadenzeVicine} color="text-warning" />
        <StatCard icon={TrendingUp} label="Media per Lavoro" value={formatValuta(stats.mediaPerLavoro)} color="text-primary" />
        <StatCard icon={Wallet} label="Incassato Mese" value={formatValuta(stats.incassatoMese)} color="text-success" />
        <StatCard icon={AlertCircle} label="Non Pagati" value={stats.nonPagati} color="text-red-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Bar Chart - Fatturato */}
        <div className="bg-dark-light rounded-xl border border-dark-lighter p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Fatturato Ultimi 6 Mesi</h2>
          <div className="h-64 sm:h-72">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Doughnut Chart - Stato Lavori */}
        <div className="bg-dark-light rounded-xl border border-dark-lighter p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Stato Lavori</h2>
          <div className="h-64 sm:h-72">
            {statiKeys.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-light">
                Nessun dato disponibile
              </div>
            )}
          </div>
        </div>

        {/* Doughnut Chart - Metodi di Pagamento */}
        <div className="bg-dark-light rounded-xl border border-dark-lighter p-4 sm:p-6 lg:col-span-2">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Metodi di Pagamento</h2>
          <div className="h-64 sm:h-72 max-w-md mx-auto">
            {pagamentiKeys.length > 0 ? (
              <Doughnut data={pagamentiDoughnutData} options={pagamentiDoughnutOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-light">
                Nessun dato disponibile
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Riepilogo Incassi */}
      <div className="bg-dark-light rounded-xl border border-dark-lighter p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Riepilogo Incassi</h2>
        {pagamentiKeys.length === 0 ? (
          <p className="text-gray-light">Nessun dato disponibile</p>
        ) : (
          <div className="space-y-3">
            {pagamentiKeys.map(metodo => {
              const MetodoIcon = METODO_ICONS[metodo] || CreditCard
              return (
                <div
                  key={metodo}
                  className="flex items-center justify-between p-3 sm:p-4 bg-dark-lighter rounded-lg gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-dark" style={{ color: METODO_COLORS[metodo] || '#6b7280' }}>
                      <MetodoIcon size={20} />
                    </div>
                    <span className="font-medium text-white truncate">
                      {METODO_LABELS[metodo] || metodo}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-8 shrink-0">
                    <span className="text-sm text-gray-light">
                      {pagamentiCount[metodo]} {pagamentiCount[metodo] === 1 ? 'scheda' : 'schede'}
                    </span>
                    <span className="font-bold text-white min-w-[80px] text-right">
                      {formatValuta(pagamentiTotale[metodo] || 0)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Ultimi Lavori */}
        <div className="bg-dark-light rounded-xl border border-dark-lighter p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Ultimi Lavori</h2>
            <Link to="/schede" className="text-primary text-sm hover:underline">
              Vedi tutti &rarr;
            </Link>
          </div>
          {ultimeSchede.length === 0 ? (
            <p className="text-gray-light">Nessun lavoro registrato</p>
          ) : (
            <div className="space-y-3">
              {ultimeSchede.map(scheda => (
                <Link
                  key={scheda.id}
                  to={`/schede/${scheda.id}`}
                  className="flex items-center justify-between p-3 sm:p-4 bg-dark-lighter rounded-lg hover:bg-dark transition-colors gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {scheda.cliente_nome || 'Cliente'} &mdash; {scheda.targa || 'N/D'}
                    </p>
                    <p className="text-sm text-gray-light truncate">
                      {scheda.modello_veicolo || ''} &bull; {formatData(scheda.data)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-primary">{formatValuta(scheda.totale || 0)}</p>
                    <p className={`text-xs ${
                      scheda.stato === 'completato' ? 'text-success' :
                      scheda.stato === 'preventivo' ? 'text-warning' :
                      'text-gray-light'
                    }`}>
                      {scheda.stato || 'in lavorazione'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Scadenze in Arrivo */}
        <div className="bg-dark-light rounded-xl border border-dark-lighter p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Scadenze in Arrivo</h2>
            <Calendar size={20} className="text-gray-light" />
          </div>
          {scadenze.length === 0 ? (
            <p className="text-gray-light">Nessuna scadenza nei prossimi 30 giorni</p>
          ) : (
            <div className="space-y-3">
              {scadenze.map(scheda => {
                const scadenzaDate = scheda.prossima_scadenza?.toDate
                  ? scheda.prossima_scadenza.toDate()
                  : new Date(scheda.prossima_scadenza)
                const oggi2 = new Date()
                const diffGiorni = Math.ceil((scadenzaDate - oggi2) / (1000 * 60 * 60 * 24))
                const isUrgente = diffGiorni <= 7

                return (
                  <Link
                    key={scheda.id}
                    to={`/schede/${scheda.id}`}
                    className="flex items-center justify-between p-3 sm:p-4 bg-dark-lighter rounded-lg hover:bg-dark transition-colors gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {scheda.cliente_nome || 'Cliente'} &mdash; {scheda.targa || 'N/D'}
                      </p>
                      <p className="text-sm text-gray-light truncate">
                        {scheda.modello_veicolo || ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-semibold ${isUrgente ? 'text-primary' : 'text-warning'}`}>
                        {formatData(scheda.prossima_scadenza)}
                      </p>
                      <p className={`text-xs ${isUrgente ? 'text-primary' : 'text-gray-light'}`}>
                        {diffGiorni <= 0 ? 'Oggi' : diffGiorni === 1 ? 'Domani' : `tra ${diffGiorni}gg`}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
