import type { Ticket, TicketStatus } from '@/types/project';

const STATUS_LABELS: Record<TicketStatus, string> = {
    todo: 'Pendiente',
    in_progress: 'En curso',
    blocked: 'Bloqueado',
    done: 'Hecho',
    cancelled: 'Cancelado',
};

const STATUS_CLASSES: Record<TicketStatus, string> = {
    todo: 'border-zinc-500 text-zinc-300',
    in_progress: 'border-amber-700 bg-amber-950/40 text-amber-200',
    blocked: 'border-red-800 bg-red-950/40 text-red-300',
    done: 'border-emerald-800 bg-emerald-950/40 text-emerald-300',
    cancelled: 'border-zinc-600 text-zinc-500',
};

const TicketRow = ({ ticket }: { ticket: Ticket }) => (
    <div className="flex items-center gap-3 border-t border-zinc-700 px-4 py-2.5">
        <p
            className={`min-w-0 flex-1 truncate text-sm ${
                ticket.status === 'cancelled' ? 'text-zinc-500 line-through' : 'text-zinc-100'
            }`}
        >
            {ticket.title}
        </p>

        <span className="shrink-0 text-xs text-zinc-500">{ticket.type}</span>
        <span className="shrink-0 text-xs font-medium text-zinc-400 uppercase">
            {ticket.priority}
        </span>
        {ticket.estimate !== null && (
            <span className="shrink-0 text-xs text-zinc-500">{ticket.estimate}p</span>
        )}

        <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${STATUS_CLASSES[ticket.status]}`}
        >
            {STATUS_LABELS[ticket.status]}
        </span>
    </div>
);

export default TicketRow;
