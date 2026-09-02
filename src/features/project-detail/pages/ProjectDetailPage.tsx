import { Link } from 'react-router';
import FeatureSection from '../components/FeatureSection';
import { useProjectDetailPage } from '../hooks/useProjectDetailPage';

const ProjectDetailPage = () => {
    const { error, isFeatureOpen, project, status, toggleFeature } = useProjectDetailPage();

    return (
        <main className="mx-auto max-w-3xl px-4 py-10">
            <Link
                to="/projects"
                className="mb-6 inline-block text-sm text-zinc-400 transition-colors hover:text-zinc-200"
            >
                ← Proyectos
            </Link>

            {(status === 'uninitialized' || status === 'loading') && (
                <p className="text-sm text-zinc-400">Cargando…</p>
            )}

            {status === 'failed' && (
                <p
                    role="alert"
                    className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300"
                >
                    {error}
                </p>
            )}

            {project && status !== 'failed' && (
                <>
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-zinc-50">{project.name}</h1>
                        <p className="mt-1 text-sm text-zinc-400">
                            {project.description || 'Sin descripción'}
                        </p>
                    </div>

                    {project.features.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-zinc-600 px-6 py-12 text-center">
                            <p className="font-medium text-zinc-300">
                                Este proyecto no tiene features
                            </p>
                            <p className="mt-1 text-sm text-zinc-400">
                                Agregá la primera para empezar a cargar tickets.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {project.features.map((feature, index) => {
                                const featureId = feature._id ?? String(index);

                                return (
                                    <FeatureSection
                                        key={featureId}
                                        feature={feature}
                                        isOpen={isFeatureOpen(featureId)}
                                        onToggle={() => toggleFeature(featureId)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </main>
    );
};

export default ProjectDetailPage;
