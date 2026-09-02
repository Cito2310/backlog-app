import CreateProjectModal from '../components/CreateProjectModal';
import DeleteProjectModal from '../components/DeleteProjectModal';
import ProjectCard from '../components/ProjectCard';
import ProjectsEmptyState from '../components/ProjectsEmptyState';
import ProjectsHeader from '../components/ProjectsHeader';
import { useProjectsPage } from '../hooks/useProjectsPage';

const ProjectsPage = () => {
    const {
        askDeleteProject,
        cancelDeleteProject,
        closeCreateProject,
        confirmDeleteProject,
        error,
        isCreateOpen,
        list,
        openCreateProject,
        projectToDelete,
        status,
    } = useProjectsPage();

    const isLoading = status === 'uninitialized' || (status === 'loading' && list.length === 0);

    return (
        <main className="mx-auto max-w-3xl px-4 py-10">
            <ProjectsHeader count={list.length} onCreate={openCreateProject} />

            {error && status === 'failed' && (
                <p
                    role="alert"
                    className="mb-4 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-xs text-red-300"
                >
                    {error}
                </p>
            )}

            {isLoading && <p className="text-sm text-zinc-400">Cargando…</p>}

            {!isLoading && list.length === 0 && <ProjectsEmptyState />}

            <ul className="space-y-3">
                {list.map((project) => (
                    <li key={project._id}>
                        <ProjectCard project={project} onDelete={askDeleteProject} />
                    </li>
                ))}
            </ul>

            <DeleteProjectModal
                project={projectToDelete}
                isBusy={status === 'loading'}
                onConfirm={() => void confirmDeleteProject()}
                onCancel={cancelDeleteProject}
            />

            <CreateProjectModal isOpen={isCreateOpen} onClose={closeCreateProject} />
        </main>
    );
};

export default ProjectsPage;
