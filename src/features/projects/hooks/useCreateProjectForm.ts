import { useForm } from 'react-hook-form';
import { isApiError } from '@/shared/api';
import { applyApiError } from '@/shared/applyApiError';
import { useAppDispatch, useAppSelector } from '@/store/store';
import type { CreateProjectBody } from '@/types/project';
import { createProject } from '../projectsThunks';

const NAME_RULES = {
    required: 'Pon un nombre al proyecto',
    maxLength: { value: 100, message: 'Máximo 100 caracteres' },
};

const DESCRIPTION_RULES = {
    maxLength: { value: 2000, message: 'Máximo 2000 caracteres' },
};

export const useCreateProjectForm = (onCreated: () => void) => {
    const dispatch = useAppDispatch();
    const isSubmitting = useAppSelector((state) => state.projects.status === 'loading');

    const { register, handleSubmit, setError, formState, reset } = useForm<CreateProjectBody>({
        defaultValues: { name: '', description: '' },
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            await dispatch(createProject(values));
            // Se limpia para que al reabrir el modal no queden los datos del anterior
            reset();
            onCreated();
        } catch (error) {
            // El 409 no trae errors[], pero acá solo puede ser el nombre repetido
            if (isApiError(error) && error.status === 409) {
                setError('name', { message: 'Ya tenés un proyecto con ese nombre' });
                return;
            }

            applyApiError(error, setError, ['name', 'description']);
        }
    });

    return {
        onSubmit,
        isSubmitting,
        errors: formState.errors,
        nameField: register('name', NAME_RULES),
        descriptionField: register('description', DESCRIPTION_RULES),
    };
};
