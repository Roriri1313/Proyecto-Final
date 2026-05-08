import { Building2, Download } from 'lucide-react'

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

const badgePrioridad = (p) => {
  if (p === 'alta') return 'bg-alert text-white dark:bg-orange-500'
  if (p === 'media') return 'bg-caution text-brand dark:bg-yellow-400 dark:text-slate-900'
  return 'bg-green-200 text-green-900 dark:bg-green-600/40 dark:text-green-200'
}

function AulaCard({ aula, formReporte, setFormReporte, onGuardarReporte, onExportarCsv }) {
  return (
    <article className="rounded-xl border border-brand/20 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-institutional dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-brand dark:text-blue-300">
          <Building2 size={18} />
          {aula.nombre}
        </h2>
        <span className={`rounded px-2 py-1 text-xs font-semibold ${badgePrioridad(aula.prioridad)}`}>
          {aula.prioridad === 'alta' ? 'Urgente' : aula.prioridad === 'media' ? 'Atencion' : 'Operativa'}
        </span>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-700 dark:text-slate-300">Estado actual: {aula.estado}</p>
        <button
          type="button"
          className="flex items-center gap-1 rounded-md border border-brand/20 px-2 py-1 text-xs font-medium text-brand transition hover:bg-brand/10 dark:border-slate-600 dark:text-blue-300 dark:hover:bg-slate-800"
          onClick={() => onExportarCsv(aula)}
        >
          <Download size={14} />
          Exportar CSV
        </button>
      </div>

      <div className="space-y-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
        <select
          className="w-full rounded border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
            className="w-full rounded border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
          className="w-full rounded border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          value={formReporte[aula.id]?.detalle || ''}
          onChange={(e) =>
            setFormReporte((prev) => ({
              ...prev,
              [aula.id]: { ...(prev[aula.id] || { prioridad: 'media' }), detalle: e.target.value },
            }))
          }
        />
        <select
          className="w-full rounded border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
          className="w-full rounded bg-brand px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
          onClick={() => onGuardarReporte(aula.id)}
        >
          Guardar reporte
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {aula.reportes.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">Sin incidencias registradas.</p>
        ) : (
          aula.reportes
            .slice()
            .reverse()
            .map((r) => (
              <div key={r.id} className="rounded border border-slate-200 p-2 text-xs dark:border-slate-700">
                <p className="font-semibold text-brand dark:text-blue-300">
                  {r.elemento} - {r.prioridad.toUpperCase()}
                </p>
                <p className="text-slate-700 dark:text-slate-300">{r.detalle}</p>
                <p className="text-slate-500 dark:text-slate-400">{r.fecha}</p>
              </div>
            ))
        )}
      </div>
    </article>
  )
}

export default AulaCard
