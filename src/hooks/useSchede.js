import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, where } from 'firebase/firestore'

export function useSchede(clienteId) {
  const [schede, setSchede] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let q
    if (clienteId) {
      q = query(collection(db, 'schede_lavoro'), where('cliente_id', '==', clienteId), orderBy('data', 'desc'))
    } else {
      q = query(collection(db, 'schede_lavoro'), orderBy('data', 'desc'))
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSchede(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    })
    return unsubscribe
  }, [clienteId])

  const aggiungiScheda = async (data) => {
    return addDoc(collection(db, 'schede_lavoro'), { ...data, creato_il: serverTimestamp() })
  }

  const aggiornaScheda = async (id, data) => {
    return updateDoc(doc(db, 'schede_lavoro', id), { ...data, aggiornato_il: serverTimestamp() })
  }

  const eliminaScheda = async (id) => {
    return deleteDoc(doc(db, 'schede_lavoro', id))
  }

  return { schede, loading, aggiungiScheda, aggiornaScheda, eliminaScheda }
}
