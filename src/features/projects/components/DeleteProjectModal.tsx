import ModalLayout from '@/shared/components/ModalLayout';
import type { ProjectSummary } from '@/types/project';

type DeleteProjectModalProps = {
    project: ProjectSummary | null;
    isBusy: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

const DeleteProjectModal = ({ project, isBusy, onConfirm, onCancel }: DeleteProjectModalProps) => (
    <ModalLayout
        isOpen={project !== null}
        onClose={onCancel}
        title="Borrar proyecto"
        size="sm"
        footer={
            <>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isBusy}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isBusy ? 'Borrando…' : 'Borrar'}
                </button>
            </>
        }
    >
        <p className="text-sm text-zinc-300">
            Vas a dar de baja <strong className="text-zinc-50">{project?.name}</strong> con todas
            sus features y tickets. No se puede deshacer desde acá.
        </p>
    </ModalLayout>
);

export default DeleteProjectModal;
