import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'
import { Search, Download, ShieldCheck } from 'lucide-react'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

function StatsPanel({
  aulas,
  reportesTotales,
  reportesPrioridad,
  darkMode,
  busquedaAula,
  setBusquedaAula,
  onExportarTodo,
}) {
  const barData = {
    labels: aulas.map((aula) => aula.nombre),
    datasets: [
      {
        label: 'Reportes por aula',
        data: aulas.map((aula) => aula.reportes.length),
        backgroundColor: darkMode ? '#60a5fa' : '#002D62',
        borderRadius: 8,
      },
    ],
  }

  const doughnutData = {
    labels: ['Alta', 'Media', 'Normal'],
    datasets: [
      {
        label: 'Prioridad',
        data: [reportesPrioridad.alta, reportesPrioridad.media, reportesPrioridad.normal],
        backgroundColor: ['#FF8C00', '#F6C445', '#34d399'],
      },
    ],
  }

  return (
    <article className="grid gap-4 rounded-xl border border-brand/20 bg-white p-4 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900 lg:grid-cols-2">
      <div className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-brand dark:text-blue-300">
          <ShieldCheck size={20} />
          Estadisticas Generales
        </h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-lg bg-brand/10 p-3 dark:bg-blue-500/20">
            <p className="text-xs text-slate-600 dark:text-slate-300">Total reportes</p>
            <p className="text-xl font-bold text-brand dark:text-blue-300">{reportesTotales}</p>
          </div>
          <div className="rounded-lg bg-alert/10 p-3">
            <p className="text-xs text-slate-600 dark:text-slate-300">Alta</p>
            <p className="text-xl font-bold text-alert">{reportesPrioridad.alta}</p>
          </div>
          <div className="rounded-lg bg-caution/20 p-3">
            <p className="text-xs text-slate-600 dark:text-slate-300">Media</p>
            <p className="text-xl font-bold text-brand dark:text-yellow-300">{reportesPrioridad.media}</p>
          </div>
          <div className="rounded-lg bg-green-100 p-3 dark:bg-green-700/30">
            <p className="text-xs text-slate-600 dark:text-slate-300">Normal</p>
            <p className="text-xl font-bold text-green-700 dark:text-green-300">{reportesPrioridad.normal}</p>
          </div>
        </div>
        <div className="h-72 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <Bar
            data={barData}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
            }}
          />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-72 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="relative sm:col-span-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Buscar aula por nombre..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={busquedaAula}
              onChange={(e) => setBusquedaAula(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
            onClick={onExportarTodo}
          >
            <Download size={16} />
            Exportar Todo
          </button>
        </div>
      </div>
    </article>
  )
}

export default StatsPanel
