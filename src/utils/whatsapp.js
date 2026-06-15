export function getWhatsAppLink(telefono, messaggio) {
  const numero = telefono.replace(/\D/g, '')
  const prefisso = numero.startsWith('39') ? numero : `39${numero}`
  return `https://wa.me/${prefisso}?text=${encodeURIComponent(messaggio)}`
}

export function inviaMessaggioRitiro(telefono, nomeCliente, modelloVeicolo) {
  const messaggio = `Gentile ${nomeCliente}, la informiamo che la sua ${modelloVeicolo} è pronta per il ritiro presso P.R. MOTO, Via Benedetto Croce 13/15, Acerra. Per info: 333 95 41 524`
  return getWhatsAppLink(telefono, messaggio)
}

export function inviaPreventivo(telefono, nomeCliente, modelloVeicolo, totale) {
  const messaggio = `Gentile ${nomeCliente}, ecco il preventivo per la sua ${modelloVeicolo}:\n\nTotale: €${totale.toFixed(2)}\n\nPer confermare o per info: 333 95 41 524\nP.R. MOTO - Acerra`
  return getWhatsAppLink(telefono, messaggio)
}

export function inviaPromemoria(telefono, nomeCliente, scadenza) {
  const messaggio = `Gentile ${nomeCliente}, le ricordiamo che è prevista una manutenzione/scadenza: ${scadenza}.\n\nPrenoti il suo appuntamento: 333 95 41 524\nP.R. MOTO - Acerra`
  return getWhatsAppLink(telefono, messaggio)
}
