import { Link } from 'react-router';
import type { ProjectSummary } from '@/types/project';

type ProjectCardProps = {
    project: ProjectSummary;
    onDelete: (project: ProjectSummary) => void;
};

const ProjectCard = ({ project, onDelete }: ProjectCardProps) => (
    <div className="group flex items-center gap-4 rounded-xl border border-zinc-600 bg-zinc-700 px-5 py-4 transition-colors hover:border-zinc-500">
        <Link to={`/projects/${project._id}`} className="min-w-0 flex-1">
            <h2 className="truncate font-medium text-zinc-50">{project.name}</h2>
            <p className="mt-1 truncate text-sm text-zinc-400">
                {project.description || 'Sin descripción'}
            </p>
        </Link>

        <button
            type="button"
            onClick={() => onDelete(project)}
            aria-label={`Borrar ${project.name}`}
            className="rounded-md p-1.5 text-zinc-500 opacity-0 transition-all group-hover:opacity-100 hover:bg-zinc-600 hover:text-red-400 focus-visible:opacity-100"
        >
            <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                className="size-4.5"
                aria-hidden="true"
            >
                <path d="M4 6h12M8 6V4h4v2M6 6l1 10h6l1-10" />
            </svg>
        </button>
    </div>
);

export default ProjectCard;
