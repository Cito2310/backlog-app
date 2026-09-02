import type { ProjectSummary } from '@/types/project';

// Datos de muestra: la pagina todavia no pide nada a la API
const MOCK_PROJECTS: ProjectSummary[] = [
    {
        _id: '1',
        name: 'apiary',
        description: 'API host para proyectos internos. Auth transversal y backlog.',
    },
    { _id: '2', name: 'backlog-app', description: 'Cliente web del backlog de proyectos.' },
    { _id: '3', name: 'portfolio', description: '' },
];

const ProjectsPage = () => (
    <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
            <div>
                <h1 className="text-2xl font-semibold text-zinc-50">Proyectos</h1>
                <p className="mt-1 text-sm text-zinc-400">
                    {MOCK_PROJECTS.length} proyectos activos
                </p>
            </div>
            <button
                type="button"
                className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white"
            >
                Nuevo proyecto
            </button>
        </div>

        <ul className="space-y-3">
            {MOCK_PROJECTS.map((project) => (
                <li key={project._id}>
                    <div className="group flex items-center gap-4 rounded-xl border border-zinc-600 bg-zinc-700 px-5 py-4 transition-colors hover:border-zinc-500">
                        <div className="min-w-0 flex-1">
                            <h2 className="truncate font-medium text-zinc-50">{project.name}</h2>
                            <p className="mt-1 truncate text-sm text-zinc-400">
                                {project.description || 'Sin descripción'}
                            </p>
                        </div>

                        <button
                            type="button"
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
                </li>
            ))}
        </ul>
    </main>
);

export default ProjectsPage;
