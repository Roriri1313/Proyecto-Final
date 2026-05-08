import { useState } from 'react'

export function useToasts() {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'success') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id))
    }, 2600)
  }

  return { toasts, addToast }
}
