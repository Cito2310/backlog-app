import ModalLayout from '@/shared/components/ModalLayout';

type CreateProjectModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const CreateProjectModal = ({ isOpen, onClose }: CreateProjectModalProps) => (
    <ModalLayout isOpen={isOpen} onClose={onClose} title="Nuevo proyecto" size="sm">
        <p className="text-sm text-zinc-400">El formulario todavía no está hecho.</p>
    </ModalLayout>
);

export default CreateProjectModal;
