type ProjectsHeaderProps = {
    count: number;
    onCreate: () => void;
};

const ProjectsHeader = ({ count, onCreate }: ProjectsHeaderProps) => (
    <div className="mb-6 flex items-end justify-between gap-4">
        <div>
            <h1 className="text-2xl font-semibold text-zinc-50">Proyectos</h1>
            <p className="mt-1 text-sm text-zinc-400">
                {count === 1 ? '1 proyecto activo' : `${count} proyectos activos`}
            </p>
        </div>

        <button
            type="button"
            onClick={onCreate}
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white"
        >
            Nuevo proyecto
        </button>
    </div>
);

export default ProjectsHeader;
