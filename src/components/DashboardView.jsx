import { ClockAlert, LogOut, Moon, Sun, Wifi, WifiOff } from 'lucide-react'
import StatsPanel from './StatsPanel'
import AulaCard from './AulaCard'

function DashboardView({
  user,
  darkMode,
  onToggleDarkMode,
  onLogout,
  networkStatus,
  networkMessage,
  aulas,
  aulasFiltradas,
  reportesTotales,
  reportesPrioridad,
  busquedaAula,
  setBusquedaAula,
  formReporte,
  setFormReporte,
  onGuardarReporte,
  onExportarAulaCsv,
  onExportarTodo,
}) {
  return (
    <main className="min-h-screen bg-slate-50 p-3 transition-colors dark:bg-slate-950 md:p-8">
      <header className="mx-auto mb-6 flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/20 bg-white p-4 shadow-institutional transition-colors dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-brand bg-brand text-sm font-bold text-white">
            BG
          </div>
          <div>
            <h1 className="text-xl font-bold text-brand dark:text-blue-300">Dashboard de Aulas Escolares</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {user?.email || 'Panel administrativo de mantenimiento'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1 rounded px-3 py-1 text-xs font-semibold ${
              networkStatus === 'estable'
                ? 'bg-green-100 text-green-800'
                : networkStatus === 'timeout'
                  ? 'bg-alert/20 text-alert'
                  : 'bg-caution/30 text-brand'
            }`}
          >
            {networkStatus === 'estable' ? <Wifi size={14} /> : networkStatus === 'timeout' ? <ClockAlert size={14} /> : <WifiOff size={14} />}
            {networkStatus === 'estable'
              ? 'Red estable'
              : networkStatus === 'timeout'
                ? 'Tiempo de espera agotado'
                : 'Conexion inestable'}
          </span>
          <button
            type="button"
            className="flex items-center gap-1 rounded bg-slate-200 px-3 py-1.5 text-sm text-slate-800 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            onClick={onToggleDarkMode}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {darkMode ? 'Claro' : 'Oscuro'}
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded bg-brand px-3 py-1.5 text-sm text-white transition hover:bg-brand/90"
            onClick={onLogout}
          >
            <LogOut size={16} />
            Cerrar sesion
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl space-y-4">
        {networkMessage && (
          <div className="rounded-lg border border-alert/30 bg-alert/10 p-3 text-sm text-alert">{networkMessage}</div>
        )}

        <StatsPanel
          aulas={aulas}
          reportesTotales={reportesTotales}
          reportesPrioridad={reportesPrioridad}
          darkMode={darkMode}
          busquedaAula={busquedaAula}
          setBusquedaAula={setBusquedaAula}
          onExportarTodo={onExportarTodo}
        />

        <div className="grid gap-4 md:grid-cols-2">
          {aulasFiltradas.map((aula) => (
            <AulaCard
              key={aula.id}
              aula={aula}
              formReporte={formReporte}
              setFormReporte={setFormReporte}
              onGuardarReporte={onGuardarReporte}
              onExportarCsv={onExportarAulaCsv}
            />
          ))}
        </div>
        {aulasFiltradas.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
            No se encontraron aulas con esa busqueda.
          </p>
        )}
      </section>

      <footer className="mx-auto mt-8 max-w-6xl rounded-xl border border-brand/20 bg-white p-4 text-center text-sm text-slate-600 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        Desarrollado por IntelGuy - {new Date().getFullYear()}
      </footer>
    </main>
  )
}

export default DashboardView
