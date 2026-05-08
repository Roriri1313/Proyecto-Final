const AULAS_KEY = 'aulas-fallback'
const PENDING_REPORTS_KEY = 'pending-reportes'

export const initialAulas = [
  { id: 1, nombre: 'Aula 4DPGM', estado: 'Operativa', prioridad: 'normal' },
  { id: 2, nombre: 'Aula 2DPGM', estado: 'Requiere revision', prioridad: 'media' },
  { id: 3, nombre: 'Laboratorio C', estado: 'Mantenimiento urgente', prioridad: 'alta' },
  { id: 4, nombre: 'Aula 6DPGM', estado: 'Operativa', prioridad: 'normal' },
]

export function getLocalAulas() {
  const saved = localStorage.getItem(AULAS_KEY)
  if (!saved) return initialAulas
  try {
    return JSON.parse(saved)
  } catch {
    return initialAulas
  }
}

export function saveLocalAulas(aulas) {
  localStorage.setItem(AULAS_KEY, JSON.stringify(aulas))
}

export function getPendingReports() {
  const saved = localStorage.getItem(PENDING_REPORTS_KEY)
  if (!saved) return []
  try {
    return JSON.parse(saved)
  } catch {
    return []
  }
}

export function savePendingReports(items) {
  localStorage.setItem(PENDING_REPORTS_KEY, JSON.stringify(items))
}

export function pushPendingReport(report) {
  const current = getPendingReports()
  current.push(report)
  savePendingReports(current)
}

export function removePendingByLocalId(localId) {
  const current = getPendingReports()
  savePendingReports(current.filter((item) => item.local_id !== localId))
}
