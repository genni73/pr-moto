import jsPDF from 'jspdf'
import 'jspdf-autotable'

export function generaPDF(scheda) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(28)
  doc.setTextColor(220, 38, 38)
  doc.setFont('helvetica', 'bolditalic')
  doc.text('P.R. MOTO', 105, 25, { align: 'center' })

  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.text('VENDITA MOTO E ASSISTENZA', 105, 33, { align: 'center' })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Via Benedetto Croce, 13/15 - Acerra (NA) | Tel: 333 95 41 524', 105, 39, { align: 'center' })

  doc.setDrawColor(200, 200, 200)
  doc.line(15, 44, 195, 44)

  // Client info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Cliente / Targa:', 15, 54)
  doc.setFont('helvetica', 'normal')
  doc.text(`${scheda.cliente_nome || ''} / ${scheda.targa || ''}`, 55, 54)

  doc.setFont('helvetica', 'bold')
  doc.text('Modello Veicolo:', 15, 62)
  doc.setFont('helvetica', 'normal')
  doc.text(scheda.modello_veicolo || '', 55, 62)

  doc.setFont('helvetica', 'bold')
  doc.text('KM / Data:', 15, 70)
  doc.setFont('helvetica', 'normal')
  doc.text(`${scheda.km || ''} / ${scheda.data || ''}`, 55, 70)

  // Parts table
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('DETTAGLIO RICAMBI E MATERIALI', 15, 82)

  const ricambiData = (scheda.ricambi || [])
    .filter(r => r.descrizione || r.prezzo)
    .map(r => [r.descrizione || '', `€ ${parseFloat(r.prezzo || 0).toFixed(2)}`])

  if (ricambiData.length > 0) {
    doc.autoTable({
      startY: 86,
      head: [['Descrizione', 'Prezzo (€)']],
      body: ricambiData,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 1: { halign: 'right', cellWidth: 35 } },
      margin: { left: 15, right: 15 },
    })
  }

  let y = doc.lastAutoTable?.finalY || 90
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Manodopera:', 15, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`€ ${parseFloat(scheda.manodopera || 0).toFixed(2)}`, 180, y, { align: 'right' })

  y += 10
  doc.setFont('helvetica', 'bold')
  doc.text('NOTE TECNICHE / PROSSIMA SCADENZA', 15, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const noteLines = doc.splitTextToSize(scheda.note_tecniche || 'Nessuna nota', 170)
  doc.text(noteLines, 15, y)
  y += noteLines.length * 5 + 4
  if (scheda.prossima_scadenza) {
    doc.text(`Prossima scadenza: ${scheda.prossima_scadenza}`, 15, y)
    y += 8
  }

  // Total
  y += 5
  doc.setDrawColor(220, 38, 38)
  doc.setLineWidth(0.5)
  doc.line(100, y, 195, y)
  y += 8
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`TOTALE LAVORO: € ${(scheda.totale || 0).toFixed(2)}`, 195, y, { align: 'right' })

  // Signatures
  y += 20
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.line(15, y, 80, y)
  doc.line(120, y, 195, y)
  doc.text('Firma Responsabile', 47, y + 5, { align: 'center' })
  doc.text('Firma Cliente', 157, y + 5, { align: 'center' })

  doc.save(`PR_MOTO_${scheda.targa || 'scheda'}_${scheda.data || ''}.pdf`)
}
