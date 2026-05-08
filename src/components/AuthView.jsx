function AuthView({
  correo,
  setCorreo,
  contrasena,
  setContrasena,
  captchaOptions,
  captchaSeleccionado,
  toggleCaptcha,
  modoRecuperacion,
  setModoRecuperacion,
  datoRecuperacion,
  setDatoRecuperacion,
  mensajeRecuperacion,
  mensajeAuth,
  loadingAuth,
  onLogin,
  onPasswordReset,
  onSignUp,
}) {
  return (
    <main className="min-h-screen bg-slate-50 p-4 transition-colors dark:bg-slate-950 md:p-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-brand/20 bg-white p-6 shadow-institutional transition-colors dark:border-slate-700 dark:bg-slate-900 md:p-10">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-brand bg-brand text-xl font-bold text-white">
            BG
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand dark:text-blue-300 md:text-3xl">
              Gestor de Revision y Mantenimiento de Aulas
            </h1>
            <p className="text-sm text-slate-700 dark:text-slate-300">"Cuidar el aula es cuidar el futuro".</p>
          </div>
        </div>

        {!modoRecuperacion ? (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-brand dark:text-blue-300">Acceso institucional</h2>
            <input
              type="email"
              className="w-full rounded-lg border border-brand/25 bg-white p-3 text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-300"
              placeholder="Correo institucional"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            <input
              type="password"
              className="w-full rounded-lg border border-brand/25 bg-white p-3 text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-300"
              placeholder="Contrasena"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
            <div className="rounded-lg border border-brand/20 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="mb-3 text-sm font-medium text-brand dark:text-blue-300">
                Verificacion visual (opcional): selecciona Banco, Ventana y Puerta.
              </p>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {captchaOptions.map((item) => {
                  const selected = captchaSeleccionado.includes(item)
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleCaptcha(item)}
                      className={`rounded-md border p-2 text-left text-sm transition ${
                        selected
                          ? 'border-brand bg-brand text-white'
                          : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
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
              onClick={onLogin}
              disabled={loadingAuth}
              className="w-full rounded-lg bg-brand py-3 font-semibold text-white transition hover:bg-brand/90 disabled:opacity-60"
            >
              {loadingAuth ? 'Validando...' : 'Entrar al panel'}
            </button>
            <button
              type="button"
              onClick={onSignUp}
              className="w-full rounded-lg border border-brand/30 py-3 text-sm font-semibold text-brand transition hover:bg-brand/5 dark:border-slate-700 dark:text-blue-300"
            >
              Crear cuenta (registro)
            </button>
            {mensajeAuth && <p className="rounded-md bg-alert/10 p-3 text-sm text-alert">{mensajeAuth}</p>}
            <button
              type="button"
              className="text-sm font-medium text-brand underline dark:text-blue-300"
              onClick={() => setModoRecuperacion(true)}
            >
              Restablecer cuenta (correo)
            </button>
          </section>
        ) : (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-brand dark:text-blue-300">Recuperar cuenta</h2>
            <input
              type="email"
              placeholder="Correo vinculado"
              className="w-full rounded-lg border border-brand/25 bg-white p-3 text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-300"
              value={datoRecuperacion}
              onChange={(e) => setDatoRecuperacion(e.target.value)}
            />
            <button
              type="button"
              className="w-full rounded-lg bg-brand py-3 font-semibold text-white"
              onClick={onPasswordReset}
            >
              Enviar solicitud
            </button>
            {mensajeRecuperacion && (
              <p className="rounded-md bg-brand/10 p-3 text-sm text-brand dark:text-blue-300">{mensajeRecuperacion}</p>
            )}
            <button
              type="button"
              className="text-sm font-medium text-brand underline dark:text-blue-300"
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

export default AuthView
