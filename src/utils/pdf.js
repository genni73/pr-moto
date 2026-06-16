import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Genera il PDF della scheda lavoro, fedele al modulo cartaceo P.R. MOTO.
 */
export function generaPDF(scheda) {
  const doc = _creaPDF(scheda)
  doc.save(`PR_MOTO_${scheda.targa || 'scheda'}_${scheda.data || ''}.pdf`)
}

/**
 * Genera il PDF del preventivo — identico alla scheda lavoro ma con
 * etichetta "PREVENTIVO" in alto a destra e numero preventivo sotto l'header.
 */
export function generaPreventivoPDF(scheda) {
  const doc = _creaPDF(scheda, { preventivo: true })
  doc.save(`Preventivo_${scheda.targa || 'scheda'}_${scheda.data || ''}.pdf`)
}

/* ------------------------------------------------------------------ */
/*  Funzione interna che costruisce il documento PDF                   */
/* ------------------------------------------------------------------ */
function _creaPDF(scheda, opzioni = {}) {
  const doc = new jsPDF()
  const pageW = doc.internal.pageSize.getWidth()   // 210
  const marginL = 15
  const marginR = 15
  const contentW = pageW - marginL - marginR        // 180

  // ─── Eventuale etichetta PREVENTIVO ──────────────────────────────
  if (opzioni.preventivo) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(220, 38, 38)
    doc.text('PREVENTIVO', pageW - marginR, 15, { align: 'right' })
    doc.setTextColor(0, 0, 0)
  }

  // ─── Header ──────────────────────────────────────────────────────
  // Titolo P.R. MOTO — rosso, grassetto corsivo, grande
  doc.setFontSize(28)
  doc.setTextColor(220, 38, 38)
  doc.setFont('helvetica', 'bolditalic')
  doc.text('P.R. MOTO', pageW / 2, 25, { align: 'center' })

  // Sottotitolo
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.text('VENDITA MOTO E ASSISTENZA', pageW / 2, 33, { align: 'center' })

  // Indirizzo e telefono
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(
    'Via Benedetto Croce, 13/15 - Acerra (NA) | Tel: 333 95 41 524',
    pageW / 2, 39, { align: 'center' }
  )

  // Linea separatrice
  doc.setDrawColor(100, 100, 100)
  doc.setLineWidth(0.5)
  doc.line(marginL, 44, pageW - marginR, 44)

  // ─── Numero preventivo (se preventivo) ───────────────────────────
  let y = 52
  if (opzioni.preventivo) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`Preventivo n. ${scheda.numero_preventivo || '---'}`, marginL, y)
    y += 8
  }

  // ─── Dati cliente / veicolo ──────────────────────────────────────
  const labelX = marginL
  const valueX = 58

  doc.setFontSize(10)

  doc.setFont('helvetica', 'bold')
  doc.text('Cliente / Targa:', labelX, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${scheda.cliente_nome || ''} / ${scheda.targa || ''}`, valueX, y)

  y += 8
  doc.setFont('helvetica', 'bold')
  doc.text('Modello Veicolo:', labelX, y)
  doc.setFont('helvetica', 'normal')
  doc.text(scheda.modello_veicolo || '', valueX, y)

  y += 8
  doc.setFont('helvetica', 'bold')
  doc.text('KM / Data:', labelX, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${scheda.km || ''} / ${scheda.data || ''}`, valueX, y)

  // Linea tratteggiata dopo i dati cliente
  y += 6
  _lineaTratteggiata(doc, marginL, y, pageW - marginR)

  // ─── Tabella ricambi e materiali ─────────────────────────────────
  y += 8
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('DETTAGLIO RICAMBI E MATERIALI', marginL, y)
  y += 4

  const ricambi = (scheda.ricambi || []).filter(r => r.descrizione || r.prezzo)
  // Aggiungiamo righe vuote tratteggiate se meno di 6 righe per simulare il modulo
  const righeMinime = 6
  const ricambiData = ricambi.map(r => [
    r.descrizione || '',
    `${_formattaPrezzo(r.prezzo)}`
  ])
  // Riempi con righe vuote tratteggiate fino a raggiungere il minimo
  while (ricambiData.length < righeMinime) {
    ricambiData.push(['..........................................................', '..............'])
  }

  autoTable(doc, {
    startY: y,
    head: [['Descrizione', 'Prezzo (€)']],
    body: ricambiData,
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [30, 30, 30],
      fontSize: 9,
      fontStyle: 'bold',
      lineColor: [180, 180, 180],
      lineWidth: 0.3,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: contentW - 35 },
      1: { halign: 'right', cellWidth: 35 },
    },
    margin: { left: marginL, right: marginR },
    styles: {
      overflow: 'linebreak',
    },
  })

  y = doc.lastAutoTable?.finalY || y + 40

  // ─── Manodopera ──────────────────────────────────────────────────
  y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Manodopera:', marginL, y)
  // Linea tratteggiata tra label e prezzo
  _lineaTratteggiata(doc, 48, y - 1, pageW - marginR - 45)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `€ ${_formattaPrezzo(scheda.manodopera)}`,
    pageW - marginR, y, { align: 'right' }
  )

  // ─── Note tecniche / Prossima scadenza ───────────────────────────
  y += 12
  _lineaTratteggiata(doc, marginL, y - 4, pageW - marginR)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('NOTE TECNICHE / PROSSIMA SCADENZA', marginL, y)
  y += 4

  // Riquadro per le note
  const noteBoxH = 28
  doc.setDrawColor(180, 180, 180)
  doc.setLineWidth(0.3)
  doc.rect(marginL, y, contentW, noteBoxH)

  // Testo delle note dentro il riquadro
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  let noteText = ''
  if (scheda.note_tecniche) {
    noteText += scheda.note_tecniche
  }
  if (scheda.prossima_scadenza) {
    noteText += noteText ? '\n' : ''
    noteText += `Prossima scadenza: ${scheda.prossima_scadenza}`
  }
  if (!noteText) {
    noteText = ' '
  }
  const noteLines = doc.splitTextToSize(noteText, contentW - 6)
  doc.text(noteLines, marginL + 3, y + 5)

  y += noteBoxH

  // ─── TOTALE ──────────────────────────────────────────────────────
  y += 10
  doc.setDrawColor(220, 38, 38)
  doc.setLineWidth(0.6)
  doc.line(pageW / 2, y, pageW - marginR, y)
  y += 8
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(
    `TOTALE LAVORO: € ${_formattaPrezzo(scheda.totale)}`,
    pageW - marginR, y, { align: 'right' }
  )

  // ─── Metodo di Pagamento ─────────────────────────────────────────
  if (scheda.metodo_pagamento) {
    y += 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    const metodiLabels = {
      contanti: 'Contanti',
      carta: 'Carta',
      fattura: 'Fattura',
      bonifico: 'Bonifico',
      non_pagato: 'Non Pagato',
    }
    const metodoLabel = metodiLabels[scheda.metodo_pagamento] || scheda.metodo_pagamento
    doc.text(
      `Metodo di Pagamento: ${metodoLabel}`,
      pageW - marginR, y, { align: 'right' }
    )
  }

  // ─── Firme ───────────────────────────────────────────────────────
  y += 25
  doc.setDrawColor(80, 80, 80)
  doc.setLineWidth(0.4)

  // Firma responsabile (sinistra)
  const firmaL_start = marginL
  const firmaL_end = marginL + 65
  doc.line(firmaL_start, y, firmaL_end, y)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Firma Responsabile', (firmaL_start + firmaL_end) / 2, y + 5, { align: 'center' })

  // Firma cliente (destra)
  const firmaR_start = pageW - marginR - 65
  const firmaR_end = pageW - marginR
  doc.line(firmaR_start, y, firmaR_end, y)
  doc.text('Firma Cliente', (firmaR_start + firmaR_end) / 2, y + 5, { align: 'center' })

  return doc
}

/* ------------------------------------------------------------------ */
/*  Utility                                                            */
/* ------------------------------------------------------------------ */

/** Disegna una linea tratteggiata orizzontale */
function _lineaTratteggiata(doc, x1, y, x2) {
  const dashLen = 2
  const gapLen = 1.5
  doc.setDrawColor(160, 160, 160)
  doc.setLineWidth(0.2)
  let x = x1
  while (x < x2) {
    const end = Math.min(x + dashLen, x2)
    doc.line(x, y, end, y)
    x = end + gapLen
  }
}

/** Formatta un prezzo come stringa con 2 decimali */
function _formattaPrezzo(valore) {
  return parseFloat(valore || 0).toFixed(2)
}
