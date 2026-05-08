import { useCallback, useEffect, useMemo, useState } from 'react'
import AuthView from './components/AuthView'
import DashboardView from './components/DashboardView'
import ToastContainer from './components/ToastContainer'
import { useDarkMode } from './hooks/useDarkMode'
import { useNetworkStatus } from './hooks/useNetworkStatus'
import { useToasts } from './hooks/useToasts'
import { downloadCsv } from './lib/csv'
import {
  getLocalAulas,
  getPendingReports,
  initialAulas,
  pushPendingReport,
  removePendingByLocalId,
  saveLocalAulas,
} from './lib/localFallback'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'

const captchaOptions = ['🪑 Banco', '🧱 Pared', '🪟 Ventana', '📚 Libro', '🚪 Puerta', '🟨 Pizarron']
const demoUsers = [
  { email: 'coordinacion@cecytebc.edu.mx', password: 'Coordinacion', role: 'admin' },
  { email: 'mantenimiento@escuela.edu', password: 'Mantto123', role: 'user' },
]

const withReportes = (aulasRows, reportesRows) =>
  aulasRows.map((aula) => ({
    ...aula,
    reportes: reportesRows
      .filter((r) => Number(r.aula_id) === Number(aula.id))
      .map((r) => ({ ...r, fecha: new Date(r.fecha).toLocaleString() })),
  }))

function App() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [captchaSeleccionado, setCaptchaSeleccionado] = useState([])
  const [modoRecuperacion, setModoRecuperacion] = useState(false)
  const [datoRecuperacion, setDatoRecuperacion] = useState('')
  const [mensajeRecuperacion, setMensajeRecuperacion] = useState('')
  const [mensajeAuth, setMensajeAuth] = useState('')
  const [loadingAuth, setLoadingAuth] = useState(false)
  const [sessionUser, setSessionUser] = useState(null)
  const [aulas, setAulas] = useState(() => getLocalAulas().map((a) => ({ ...a, reportes: [] })))
  const [formReporte, setFormReporte] = useState({})
  const [busquedaAula, setBusquedaAula] = useState('')
  const { darkMode, setDarkMode } = useDarkMode()
  const { toasts, addToast } = useToasts()
  const { online, networkStatus, setNetworkStatus, networkMessage, setNetworkMessage } = useNetworkStatus()

  const isAdmin = sessionUser?.app_metadata?.role === 'admin'

  const cargarDatos = useCallback(async (user) => {
    if (!isSupabaseConfigured || !supabase || !user) {
      const local = getLocalAulas().map((a) => ({ ...a, reportes: a.reportes || [] }))
      setAulas(local)
      return
    }
    try {
      const { data: aulasRows, error: aulasError } = await supabase
        .from('aulas')
        .select('id, nombre, estado, prioridad')
        .order('id', { ascending: true })
      if (aulasError) throw aulasError

      let query = supabase
        .from('reportes')
        .select('id, aula_id, elemento, detalle, prioridad, fecha, user_id')
        .order('fecha', { ascending: true })
      if (!isAdmin) query = query.eq('user_id', user.id)

      const { data: reportesRows, error: reportesError } = await query
      if (reportesError) throw reportesError

      const baseAulas = aulasRows.length ? aulasRows : initialAulas
      const merged = withReportes(baseAulas, reportesRows || [])
      setAulas(merged)
      saveLocalAulas(merged)
      setNetworkStatus('estable')
    } catch {
      setNetworkStatus('timeout')
      setNetworkMessage('No se pudo leer Supabase. Mostrando respaldo local.')
      const local = getLocalAulas().map((a) => ({ ...a, reportes: a.reportes || [] }))
      setAulas(local)
    }
  }, [isAdmin, setNetworkMessage, setNetworkStatus])

  const sincronizarPendientes = useCallback(async (user) => {
    if (!online || !isSupabaseConfigured || !supabase || !user) return
    const pendientes = getPendingReports()
    if (!pendientes.length) return
    for (const item of pendientes) {
      const { local_id: localId, ...payload } = item
      const { error: insError } = await supabase.from('reportes').insert(payload)
      if (insError) continue
      removePendingByLocalId(localId)
    }
    addToast('Pendientes sincronizados con Supabase.', 'success')
  }, [addToast, online])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user ?? null
      setSessionUser(user)
      if (user) {
        cargarDatos(user)
        sincronizarPendientes(user)
      }
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setSessionUser(user)
      if (user) {
        cargarDatos(user)
        sincronizarPendientes(user)
      }
    })
    return () => data.subscription.unsubscribe()
  }, [cargarDatos, sincronizarPendientes])

  useEffect(() => {
    const onBackOnline = () => {
      if (sessionUser) {
        sincronizarPendientes(sessionUser)
        cargarDatos(sessionUser)
      }
    }
    window.addEventListener('online', onBackOnline)
    return () => window.removeEventListener('online', onBackOnline)
  }, [sessionUser, sincronizarPendientes, cargarDatos])

  useEffect(() => {
    if (!sessionUser || !isSupabaseConfigured || !supabase) return
    const channel = supabase
      .channel('reportes-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reportes' }, () => {
        cargarDatos(sessionUser)
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionUser, isAdmin, cargarDatos])

  const toggleCaptcha = (item) => {
    setCaptchaSeleccionado((prev) => {
      if (prev.includes(item)) return prev.filter((el) => el !== item)
      if (prev.length >= 3) return prev
      return [...prev, item]
    })
  }

  const validarLogin = () => {
    if (!correo || !contrasena) return 'Debes capturar correo y contrasena.'
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
    if (!correoValido) return 'Formato de correo invalido.'
    return ''
  }

  const login = async () => {
    setMensajeAuth('')
    const errorValidacion = validarLogin()
    if (errorValidacion) {
      setMensajeAuth(errorValidacion)
      return
    }
    setLoadingAuth(true)
    try {
      if (!isSupabaseConfigured || !supabase) {
        const demoUser = demoUsers.find(
          (u) => u.email.toLowerCase() === correo.trim().toLowerCase() && u.password === contrasena,
        )
        if (!demoUser) {
          throw new Error(
            'Supabase no configurado. Usa usuario demo valido o configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
          )
        }
        setSessionUser({
          id: `demo-${demoUser.email}`,
          email: demoUser.email,
          app_metadata: { role: demoUser.role },
        })
        addToast('Entraste en modo demo local.', 'success')
        setCaptchaSeleccionado([])
        return
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: correo.trim(),
        password: contrasena,
      })
      if (error) throw error
      addToast('Inicio de sesion exitoso.', 'success')
      setCaptchaSeleccionado([])
    } catch (error) {
      setMensajeAuth(error.message || 'No se pudo iniciar sesion.')
    } finally {
      setLoadingAuth(false)
    }
  }

  const signUp = async () => {
    const errorValidacion = validarLogin()
    if (errorValidacion) {
      setMensajeAuth(errorValidacion)
      return
    }
    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Para registrar usuarios necesitas configurar Supabase primero.')
      }
      const { error } = await supabase.auth.signUp({
        email: correo.trim(),
        password: contrasena,
      })
      if (error) throw error
      addToast('Cuenta creada. Revisa tu correo para confirmar.', 'success')
    } catch (error) {
      setMensajeAuth(error.message || 'No se pudo crear la cuenta.')
    }
  }

  const enviarRecuperacion = async () => {
    if (!datoRecuperacion) {
      setMensajeRecuperacion('Escribe un correo valido.')
      return
    }
    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Para recuperar cuenta necesitas configurar Supabase primero.')
      }
      const { error } = await supabase.auth.resetPasswordForEmail(datoRecuperacion.trim())
      if (error) throw error
      setMensajeRecuperacion('Solicitud enviada. Revisa tu correo.')
      addToast('Correo de recuperacion enviado.', 'success')
    } catch (error) {
      setMensajeRecuperacion(error.message || 'No se pudo enviar la recuperacion.')
    }
  }

  const guardarReporte = async (aulaId) => {
    const reporte = formReporte[aulaId]
    const elementoFinal =
      reporte?.elemento === 'Otro' ? (reporte?.elementoOtro || '').trim() : (reporte?.elemento || '').trim()
    if (!elementoFinal || !reporte?.detalle) {
      addToast('Completa elemento y descripcion para guardar el reporte.', 'warning')
      return
    }
    const nowIso = new Date().toISOString()
    const reporteVista = {
      id: crypto.randomUUID(),
      aula_id: aulaId,
      elemento: elementoFinal,
      detalle: reporte.detalle,
      prioridad: reporte.prioridad || 'media',
      fecha: new Date(nowIso).toLocaleString(),
      user_id: sessionUser?.id,
    }

    setAulas((prev) =>
      prev.map((a) =>
        Number(a.id) === Number(aulaId)
          ? {
              ...a,
              estado: 'Requiere revision',
              prioridad: reporteVista.prioridad,
              reportes: [...a.reportes, reporteVista],
            }
          : a,
      ),
    )
    setFormReporte((prev) => ({
      ...prev,
      [aulaId]: { elemento: '', elementoOtro: '', detalle: '', prioridad: 'media' },
    }))

    const payload = {
      aula_id: aulaId,
      elemento: elementoFinal,
      detalle: reporte.detalle,
      prioridad: reporteVista.prioridad,
      fecha: nowIso,
      user_id: sessionUser?.id,
    }

    if (!online || !isSupabaseConfigured || !supabase || !sessionUser) {
      pushPendingReport({ local_id: crypto.randomUUID(), ...payload })
      setNetworkStatus('inestable')
      setNetworkMessage('Reporte guardado localmente. Se sincronizara al volver internet.')
      addToast('Reporte guardado localmente.', 'warning')
      return
    }

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), 7000)
      })
      const insertPromise = supabase.from('reportes').insert(payload)
      const result = await Promise.race([insertPromise, timeoutPromise])
      if (result.error) throw result.error

      await supabase
        .from('aulas')
        .update({ estado: 'Requiere revision', prioridad: reporteVista.prioridad })
        .eq('id', aulaId)

      setNetworkStatus('estable')
      setNetworkMessage('Reporte guardado correctamente.')
      addToast('Reporte guardado en Supabase.', 'success')
    } catch {
      pushPendingReport({ local_id: crypto.randomUUID(), ...payload })
      setNetworkStatus('timeout')
      setNetworkMessage('Tiempo agotado. Se guardo localmente y se sincronizara despues.')
      addToast('Se guardo localmente por timeout.', 'warning')
    }
  }

  const exportarAulaCsv = (aula) => {
    if (!aula.reportes.length) {
      addToast(`No hay reportes en ${aula.nombre}.`, 'warning')
      return
    }
    downloadCsv(
      `reportes-${aula.nombre.replaceAll(' ', '-').toLowerCase()}.csv`,
      ['Fecha', 'Elemento', 'Descripcion', 'Prioridad'],
      aula.reportes.map((r) => [r.fecha, r.elemento, r.detalle, r.prioridad]),
    )
    addToast(`CSV exportado de ${aula.nombre}.`, 'success')
  }

  const exportarTodo = () => {
    const todos = aulas.flatMap((a) => a.reportes.map((r) => ({ ...r, aula: a.nombre })))
    if (!todos.length) {
      addToast('No hay reportes para exportar.', 'warning')
      return
    }
    downloadCsv(
      'reportes-todas-las-aulas.csv',
      ['Aula', 'Fecha', 'Elemento', 'Descripcion', 'Prioridad'],
      todos.map((r) => [r.aula, r.fecha, r.elemento, r.detalle, r.prioridad]),
    )
    addToast('CSV global exportado.', 'success')
  }

  const cerrarSesion = async () => {
    const ok = window.confirm('Seguro que deseas cerrar sesion?')
    if (!ok) return
    if (supabase) await supabase.auth.signOut()
    setSessionUser(null)
    addToast('Sesion cerrada.', 'success')
  }

  const aulasFiltradas = useMemo(
    () =>
      aulas
        .filter((aula) => aula.nombre.toLowerCase().includes(busquedaAula.toLowerCase()))
        .slice()
        .sort((a, b) => (a.prioridad === 'alta' ? -1 : b.prioridad === 'alta' ? 1 : 0)),
    [aulas, busquedaAula],
  )

  const reportesTotales = aulas.reduce((acc, aula) => acc + aula.reportes.length, 0)
  const reportesPrioridad = aulas.reduce(
    (acc, aula) => {
      aula.reportes.forEach((r) => {
        if (r.prioridad === 'alta') acc.alta += 1
        else if (r.prioridad === 'media') acc.media += 1
        else acc.normal += 1
      })
      return acc
    },
    { alta: 0, media: 0, normal: 0 },
  )

  return (
    <>
      {!sessionUser ? (
        <AuthView
          correo={correo}
          setCorreo={setCorreo}
          contrasena={contrasena}
          setContrasena={setContrasena}
          captchaOptions={captchaOptions}
          captchaSeleccionado={captchaSeleccionado}
          toggleCaptcha={toggleCaptcha}
          modoRecuperacion={modoRecuperacion}
          setModoRecuperacion={setModoRecuperacion}
          datoRecuperacion={datoRecuperacion}
          setDatoRecuperacion={setDatoRecuperacion}
          mensajeRecuperacion={mensajeRecuperacion}
          mensajeAuth={mensajeAuth}
          loadingAuth={loadingAuth}
          onLogin={login}
          onPasswordReset={enviarRecuperacion}
          onSignUp={signUp}
        />
      ) : (
        <DashboardView
          user={sessionUser}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((prev) => !prev)}
          onLogout={cerrarSesion}
          networkStatus={networkStatus}
          networkMessage={networkMessage}
          aulas={aulas}
          aulasFiltradas={aulasFiltradas}
          reportesTotales={reportesTotales}
          reportesPrioridad={reportesPrioridad}
          busquedaAula={busquedaAula}
          setBusquedaAula={setBusquedaAula}
          formReporte={formReporte}
          setFormReporte={setFormReporte}
          onGuardarReporte={guardarReporte}
          onExportarAulaCsv={exportarAulaCsv}
          onExportarTodo={exportarTodo}
        />
      )}
      <ToastContainer toasts={toasts} />
    </>
  )
}

export default App
