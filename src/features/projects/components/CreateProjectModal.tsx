import FormField from '@/shared/components/FormField';
import ModalLayout from '@/shared/components/ModalLayout';
import { useCreateProjectForm } from '../hooks/useCreateProjectForm';

type CreateProjectModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const CreateProjectModal = ({ isOpen, onClose }: CreateProjectModalProps) => {
    const { descriptionField, errors, isSubmitting, nameField, onSubmit } =
        useCreateProjectForm(onClose);

    return (
        <ModalLayout isOpen={isOpen} onClose={onClose} title="Nuevo proyecto" size="sm">
            <form className="space-y-4" onSubmit={onSubmit} noValidate>
                <FormField
                    field={nameField}
                    error={errors.name?.message}
                    id="name"
                    label="Nombre"
                    placeholder="apiary"
                    hint="Tiene que ser único entre tus proyectos activos."
                />
                <FormField
                    field={descriptionField}
                    error={errors.description?.message}
                    id="description"
                    label="Descripción"
                    placeholder="Para qué es este proyecto"
                    multiline
                />

                {errors.root && (
                    <p
                        role="alert"
                        className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-xs text-red-300"
                    >
                        {errors.root.message}
                    </p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creando…' : 'Crear'}
                    </button>
                </div>
            </form>
        </ModalLayout>
    );
};

export default CreateProjectModal;
