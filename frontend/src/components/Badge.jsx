const statusStyles = {
  TODO: 'bg-slate-950 border-slate-800 text-slate-300',
  IN_PROGRESS: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
  COMPLETED: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
};

const priorityStyles = {
  LOW: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
  MEDIUM: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  HIGH: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
};

const labels = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

export default function Badge({ value, type = 'status', className = '' }) {
  const styles = type === 'priority' ? priorityStyles : statusStyles;

  return (
    <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${styles[value] || 'border-slate-800 bg-slate-950 text-slate-300'} ${className}`}>
      {labels[value] || value}
    </span>
  );
}
