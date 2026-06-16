import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'

export function useClienti() {
  const [clienti, setClienti] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'clienti'), orderBy('cognome'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setClienti(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const aggiungiCliente = async (data) => {
    return addDoc(collection(db, 'clienti'), { ...data, creato_il: serverTimestamp() })
  }

  const aggiornaCliente = async (id, data) => {
    return updateDoc(doc(db, 'clienti', id), { ...data, aggiornato_il: serverTimestamp() })
  }

  const eliminaCliente = async (id) => {
    return deleteDoc(doc(db, 'clienti', id))
  }

  return { clienti, loading, aggiungiCliente, aggiornaCliente, eliminaCliente }
}
