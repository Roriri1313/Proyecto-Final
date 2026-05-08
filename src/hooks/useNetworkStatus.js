import { useEffect, useState } from 'react'

export function useNetworkStatus() {
  const [online, setOnline] = useState(() => navigator.onLine)
  const [networkStatus, setNetworkStatus] = useState(() => (navigator.onLine ? 'estable' : 'inestable'))
  const [networkMessage, setNetworkMessage] = useState('')

  useEffect(() => {
    const goOnline = () => {
      setOnline(true)
      setNetworkStatus('estable')
      setNetworkMessage('')
    }
    const goOffline = () => {
      setOnline(false)
      setNetworkStatus('inestable')
      setNetworkMessage('Conexion inestable: los datos se guardaran localmente hasta recuperar internet.')
    }

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return { online, networkStatus, setNetworkStatus, networkMessage, setNetworkMessage }
}
