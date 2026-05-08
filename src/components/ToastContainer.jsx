import { CheckCircle2, ClockAlert } from 'lucide-react'

function ToastContainer({ toasts }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[92vw] max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm shadow-lg transition ${
            toast.type === 'success'
              ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-600 dark:bg-green-900/40 dark:text-green-200'
              : 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-600 dark:bg-amber-900/40 dark:text-amber-200'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <ClockAlert size={16} />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
