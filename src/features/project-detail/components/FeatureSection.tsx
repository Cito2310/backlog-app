import type { Feature } from '@/types/project';
import TicketRow from './TicketRow';

type FeatureSectionProps = {
    feature: Feature;
    isOpen: boolean;
    onToggle: () => void;
};

const FeatureSection = ({ feature, isOpen, onToggle }: FeatureSectionProps) => (
    <div className="overflow-hidden rounded-xl border border-zinc-600 bg-zinc-700">
        <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-600/50"
        >
            <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className={`size-4 shrink-0 text-zinc-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                aria-hidden="true"
            >
                <path d="M7 4l6 6-6 6" />
            </svg>

            <div className="min-w-0 flex-1">
                <h2 className="truncate font-medium text-zinc-50">{feature.name}</h2>
                {feature.description && (
                    <p className="truncate text-xs text-zinc-400">{feature.description}</p>
                )}
            </div>

            <span className="shrink-0 text-xs text-zinc-400">
                {feature.tickets.length === 1 ? '1 ticket' : `${feature.tickets.length} tickets`}
            </span>
        </button>

        {isOpen &&
            (feature.tickets.length === 0 ? (
                <p className="border-t border-zinc-700 px-4 py-3 text-xs text-zinc-500">
                    Sin tickets todavía.
                </p>
            ) : (
                feature.tickets.map((ticket, index) => (
                    <TicketRow key={ticket._id ?? index} ticket={ticket} />
                ))
            ))}
    </div>
);

export default FeatureSection;
