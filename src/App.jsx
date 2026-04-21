import { useEffect, useMemo, useState } from 'react'

function App() {
  const users = useMemo(
    () => [
      {
        id: 1,
        email: 'coordinacion@cecytebc.edu.mx',
        password: 'Coordinacion',
        phone: '5551234567',
      },
      {
        id: 2,
        email: 'mantenimiento@escuela.edu',
        password: 'Mantto123',
        phone: '5559876543',
      },
    ],
    [],
  )
  const captchaOptions = ['🪑 Banco', '🧱 Pared', '🪟 Ventana', '📚 Libro', '🚪 Puerta', '🟨 Pizarron']
  const elementosMantenimiento = [
    'Banco',
    'Pizarron',
    'Puerta',
    'Ventana',
    'Pared',
    'Techo',
    'Piso',
    'Iluminacion',
    'Contactos electricos',
    'Ventilacion',
    'Otro',
  ]

  const initialAulas = [
    { id: 1, nombre: 'Aula 4DPGM', estado: 'Operativa', prioridad: 'normal', reportes: [] },
    { id: 2, nombre: 'Aula 2DPGM', estado: 'Requiere revision', prioridad: 'media', reportes: [] },
    { id: 3, nombre: 'Laboratorio C', estado: 'Mantenimiento urgente', prioridad: 'alta', reportes: [] },
    { id: 4, nombre: 'Aula 6DPGM', estado: 'Operativa', prioridad: 'normal', reportes: [] },
  ]

  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [captchaSeleccionado, setCaptchaSeleccionado] = useState([])
  const [usuarioActual, setUsuarioActual] = useState(null)
  const [mensajeAuth, setMensajeAuth] = useState('')
  const [loadingAuth, setLoadingAuth] = useState(false)
  const [intentosFallidos, setIntentosFallidos] = useState(() => Number(localStorage.getItem('intentos') || 0))
  const [bloqueadoHasta, setBloqueadoHasta] = useState(() => Number(localStorage.getItem('bloqueadoHasta') || 0))
  const [modoRecuperacion, setModoRecuperacion] = useState(false)
  const [datoRecuperacion, setDatoRecuperacion] = useState('')
  const [mensajeRecuperacion, setMensajeRecuperacion] = useState('')
  const [aulas, setAulas] = useState(() => {
    const saved = localStorage.getItem('aulas-estado')
    try {
      return saved ? JSON.parse(saved) : initialAulas
    } catch {
      return initialAulas
    }
  })
  const [formReporte, setFormReporte] = useState({})
  const [estadoRed, setEstadoRed] = useState('estable')
  const [avisoRed, setAvisoRed] = useState('')

  useEffect(() => {
    localStorage.setItem('intentos', String(intentosFallidos))
    localStorage.setItem('bloqueadoHasta', String(bloqueadoHasta))
    localStorage.setItem('aulas-estado', JSON.stringify(aulas))
  }, [intentosFallidos, bloqueadoHasta, aulas])

  useEffect(() => {
    const online = () => {
      setEstadoRed('estable')
      setAvisoRed('')
    }
    const offline = () => {
      setEstadoRed('inestable')
      setAvisoRed('Conexion inestable: trabaja sin red y reintenta guardar cuando vuelva internet.')
    }
    window.addEventListener('online', online)
    window.addEventListener('offline', offline)
    return () => {
      window.removeEventListener('online', online)
      window.removeEventListener('offline', offline)
    }
  }, [])

  const captchaValido =
    captchaSeleccionado.includes('🪑 Banco') &&
    captchaSeleccionado.includes('🪟 Ventana') &&
    captchaSeleccionado.includes('🚪 Puerta') &&
    captchaSeleccionado.length === 3

  const toggleCaptcha = (item) => {
    setCaptchaSeleccionado((prev) => {
      if (prev.includes(item)) return prev.filter((el) => el !== item)
      if (prev.length >= 3) return prev
      return [...prev, item]
    })
  }

  const registrarIntentoFallido = (mensaje) => {
    setIntentosFallidos((prev) => {
      const nuevos = prev + 1
      if (nuevos >= 5) {
        const tiempoBloqueo = Date.now() + 60 * 60 * 1000
        setBloqueadoHasta(tiempoBloqueo)
        setMensajeAuth('Demasiados intentos fallidos. Sesion bloqueada por 60 minutos.')
        return 0
      }
      setMensajeAuth(mensaje)
      return nuevos
    })
  }

  const login = () => {
    setMensajeAuth('')
    if (!correo || !contrasena) {
      setMensajeAuth('Debes capturar correo y contrasena.')
      return
    }
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
    if (!correoValido) {
      setMensajeAuth('Formato de correo invalido.')
      return
    }
    if (contrasena.length < 6) {
      setMensajeAuth('La contrasena debe tener al menos 6 caracteres.')
      return
    }

    if (Date.now() < bloqueadoHasta) {
      const mins = Math.ceil((bloqueadoHasta - Date.now()) / 60000)
      setMensajeAuth(`Sesion bloqueada por seguridad. Intenta en ${mins} minuto(s).`)
      return
    }

    if (!captchaValido) {
      setMensajeAuth('Captcha invalido. Selecciona Banco, Ventana y Puerta.')
      return
    }

    setLoadingAuth(true)
    setTimeout(() => {
      const usuario = users.find((u) => u.email.toLowerCase() === correo.toLowerCase())
      if (!usuario) {
        registrarIntentoFallido('El correo no existe en el sistema.')
      } else if (usuario.password !== contrasena) {
        registrarIntentoFallido('Contrasena incorrecta.')
      } else {
        setUsuarioActual(usuario)
        setIntentosFallidos(0)
        setBloqueadoHasta(0)
        setMensajeAuth('')
      }
      setLoadingAuth(false)
    }, 700)
  }

  const enviarRecuperacion = () => {
    const encontrado = users.find(
      (u) => u.email.toLowerCase() === datoRecuperacion.toLowerCase() || u.phone === datoRecuperacion,
    )
    if (!encontrado) {
      setMensajeRecuperacion('No se encontro una cuenta vinculada con ese dato.')
      return
    }
    setMensajeRecuperacion('Solicitud enviada. Revisa tu correo o telefono vinculado.')
  }

  const guardarReporte = async (aulaId) => {
    const reporte = formReporte[aulaId]
    const elementoFinal =
      reporte?.elemento === 'Otro' ? (reporte?.elementoOtro || '').trim() : (reporte?.elemento || '').trim()
    if (!elementoFinal || !reporte?.detalle) {
      setAvisoRed('Completa elemento y descripcion del dano.')
      return
    }

    // Guardado local inmediato (para no perder reportes aunque la red falle).
    const reporteFinal = {
      ...reporte,
      elemento: elementoFinal,
      id: crypto.randomUUID(),
      fecha: new Date().toLocaleString(),
    }
    setAulas((prev) =>
      prev.map((a) =>
        a.id === aulaId
          ? {
              ...a,
              estado: 'Requiere revision',
              prioridad: reporte.prioridad,
              reportes: [...a.reportes, reporteFinal],
            }
          : a,
      ),
    )
    setFormReporte((prev) => ({
      ...prev,
      [aulaId]: { elemento: '', elementoOtro: '', detalle: '', prioridad: 'media' },
    }))

    if (!navigator.onLine) {
      setEstadoRed('inestable')
      setAvisoRed('Conexion inestable: el reporte se guardo localmente. Sincroniza cuando vuelva internet.')
      return
    }

    // Simulacion de sincronizacion (para mostrar estados "inestable/timeout" sin bloquear el uso).
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 6500))
    const fakeSync = new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 800 + Math.random() * 900))

    try {
      // De forma ocasional forzamos un retraso para simular "timeout".
      const induceTimeout = Math.random() < 0.12
      await Promise.race([induceTimeout ? timeout : fakeSync, timeout])
      setAvisoRed('Reporte guardado correctamente.')
      setEstadoRed('estable')
    } catch {
      setEstadoRed('timeout')
      setAvisoRed('Tiempo de espera agotado al guardar. El reporte quedo guardado localmente; reintenta mas tarde.')
    }
  }

  const badgePrioridad = (p) => {
    if (p === 'alta') return 'bg-alert text-white'
    if (p === 'media') return 'bg-caution text-brand'
    return 'bg-green-200 text-green-900'
  }

  if (!usuarioActual) {
    return (
      <main className="min-h-screen bg-white p-4 md:p-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-brand/20 bg-white p-6 shadow-institutional md:p-10">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-brand bg-brand text-xl font-bold text-white">
              BG
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand md:text-3xl">
                Gestor de Revision y Mantenimiento de Aulas
              </h1>
              <p className="text-sm text-slate-700">"Cuidar el aula es cuidar el futuro".</p>
            </div>
          </div>

          {!modoRecuperacion ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-brand">Acceso institucional</h2>
              <input
                type="email"
                className="w-full rounded-lg border border-brand/25 p-3 focus:border-brand focus:outline-none"
                placeholder="Correo institucional"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
              <input
                type="password"
                className="w-full rounded-lg border border-brand/25 p-3 focus:border-brand focus:outline-none"
                placeholder="Contrasena"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
              />
              <div className="rounded-lg border border-brand/20 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-medium text-brand">
                  Verificacion visual (captcha): selecciona Banco, Ventana y Puerta.
                </p>
                <p className="mb-3 text-xs text-slate-600">
                  Nota: esto solo valida acceso. En mantenimiento puedes reportar muchos mas elementos.
                </p>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {captchaOptions.map((item) => {
                    const selected = captchaSeleccionado.includes(item)
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleCaptcha(item)}
                        className={`rounded-md border p-2 text-left text-sm ${
                          selected ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={login}
                disabled={loadingAuth}
                className="w-full rounded-lg bg-brand py-3 font-semibold text-white transition hover:bg-brand/90 disabled:opacity-60"
              >
                {loadingAuth ? 'Validando...' : 'Entrar al panel'}
              </button>
              {mensajeAuth && <p className="rounded-md bg-alert/10 p-3 text-sm text-alert">{mensajeAuth}</p>}
              <button
                type="button"
                className="text-sm font-medium text-brand underline"
                onClick={() => {
                  setModoRecuperacion(true)
                  setMensajeRecuperacion('')
                }}
              >
                Restablecer cuenta (correo o telefono)
              </button>
            </section>
          ) : (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-brand">Recuperar cuenta</h2>
              <input
                type="text"
                placeholder="Correo o telefono vinculado"
                className="w-full rounded-lg border border-brand/25 p-3 focus:border-brand focus:outline-none"
                value={datoRecuperacion}
                onChange={(e) => setDatoRecuperacion(e.target.value)}
              />
              <button
                type="button"
                className="w-full rounded-lg bg-brand py-3 font-semibold text-white"
                onClick={enviarRecuperacion}
              >
                Enviar solicitud
              </button>
              {mensajeRecuperacion && (
                <p className="rounded-md bg-brand/10 p-3 text-sm text-brand">{mensajeRecuperacion}</p>
              )}
              <button
                type="button"
                className="text-sm font-medium text-brand underline"
                onClick={() => setModoRecuperacion(false)}
              >
                Volver al login
              </button>
            </section>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white p-4 md:p-8">
      <header className="mx-auto mb-6 flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/20 bg-white p-4 shadow-institutional">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-brand bg-brand text-sm font-bold text-white">
            BG
          </div>
          <div>
            <h1 className="text-xl font-bold text-brand">Dashboard de Aulas Escolares</h1>
            <p className="text-sm text-slate-600">Panel administrativo de mantenimiento</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded px-3 py-1 text-xs font-semibold ${
              estadoRed === 'estable'
                ? 'bg-green-100 text-green-800'
                : estadoRed === 'timeout'
                  ? 'bg-alert/20 text-alert'
                  : 'bg-caution/30 text-brand'
            }`}
          >
            {estadoRed === 'estable'
              ? 'Red estable'
              : estadoRed === 'timeout'
                ? 'Tiempo de espera agotado'
                : 'Conexion inestable'}
          </span>
          <button
            type="button"
            className="rounded bg-brand px-3 py-1.5 text-sm text-white"
            onClick={() => setUsuarioActual(null)}
          >
            Cerrar sesion
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl space-y-4">
        {avisoRed && (
          <div className="rounded-lg border border-alert/30 bg-alert/10 p-3 text-sm text-alert">{avisoRed}</div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {aulas
            .slice()
            .sort((a, b) => (a.prioridad === 'alta' ? -1 : b.prioridad === 'alta' ? 1 : 0))
            .map((aula) => (
              <article key={aula.id} className="rounded-xl border border-brand/20 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-brand">{aula.nombre}</h2>
                  <span className={`rounded px-2 py-1 text-xs font-semibold ${badgePrioridad(aula.prioridad)}`}>
                    {aula.prioridad === 'alta'
                      ? 'Urgente'
                      : aula.prioridad === 'media'
                        ? 'Atencion'
                        : 'Operativa'}
                  </span>
                </div>
                <p className="mb-3 text-sm text-slate-700">Estado actual: {aula.estado}</p>

                <div className="space-y-2 rounded-lg bg-slate-50 p-3">
                  <select
                    className="w-full rounded border border-slate-300 p-2 text-sm"
                    value={formReporte[aula.id]?.elemento || ''}
                    onChange={(e) =>
                      setFormReporte((prev) => ({
                        ...prev,
                        [aula.id]: { ...(prev[aula.id] || { prioridad: 'media' }), elemento: e.target.value },
                      }))
                    }
                  >
                    <option value="">Selecciona elemento a mantener</option>
                    {elementosMantenimiento.map((el) => (
                      <option key={el} value={el}>
                        {el}
                      </option>
                    ))}
                  </select>
                  {formReporte[aula.id]?.elemento === 'Otro' && (
                    <input
                      type="text"
                      placeholder="Especifica el elemento"
                      className="w-full rounded border border-slate-300 p-2 text-sm"
                      value={formReporte[aula.id]?.elementoOtro || ''}
                      onChange={(e) =>
                        setFormReporte((prev) => ({
                          ...prev,
                          [aula.id]: {
                            ...(prev[aula.id] || { prioridad: 'media' }),
                            elementoOtro: e.target.value,
                          },
                        }))
                      }
                    />
                  )}
                  <textarea
                    rows="2"
                    placeholder="Descripcion del daño o incidencia"
                    className="w-full rounded border border-slate-300 p-2 text-sm"
                    value={formReporte[aula.id]?.detalle || ''}
                    onChange={(e) =>
                      setFormReporte((prev) => ({
                        ...prev,
                        [aula.id]: { ...(prev[aula.id] || { prioridad: 'media' }), detalle: e.target.value },
                      }))
                    }
                  />
                  <select
                    className="w-full rounded border border-slate-300 p-2 text-sm"
                    value={formReporte[aula.id]?.prioridad || 'media'}
                    onChange={(e) =>
                      setFormReporte((prev) => ({
                        ...prev,
                        [aula.id]: { ...(prev[aula.id] || {}), prioridad: e.target.value },
                      }))
                    }
                  >
                    <option value="alta">Alta (naranja)</option>
                    <option value="media">Media (amarillo)</option>
                    <option value="normal">Normal</option>
                  </select>
                  <button
                    type="button"
                    className="w-full rounded bg-brand px-3 py-2 text-sm font-semibold text-white"
                    onClick={() => guardarReporte(aula.id)}
                  >
                    Guardar reporte
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {aula.reportes.length === 0 ? (
                    <p className="text-xs text-slate-500">Sin incidencias registradas.</p>
                  ) : (
                    aula.reportes
                      .slice()
                      .reverse()
                      .map((r) => (
                        <div key={r.id} className="rounded border border-slate-200 p-2 text-xs">
                          <p className="font-semibold text-brand">
                            {r.elemento} - {r.prioridad.toUpperCase()}
                          </p>
                          <p className="text-slate-700">{r.detalle}</p>
                          <p className="text-slate-500">{r.fecha}</p>
                        </div>
                      ))
                  )}
                </div>
              </article>
            ))}
        </div>
      </section>
    </main>
  )
}

export default App
