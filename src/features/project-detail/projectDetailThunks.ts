import { apiGet, toErrorPayload } from '@/shared/api';
import type { AppDispatch } from '@/store/store';
import type { ProjectResponse } from '@/types/project';
import { detailRequestFailed, detailRequestStarted, projectOpened } from './projectDetailSlice';

// A diferencia de los thunks de escritura, este no relanza: no hay formulario esperando el
// errors[], y el mensaje ya queda en el store para que la pantalla lo muestre
export const fetchProjectDetail = (projectId: string) => async (dispatch: AppDispatch) => {
    dispatch(detailRequestStarted());
    try {
        const dataProject = await apiGet<ProjectResponse>(`/backlog-app/projects/${projectId}`);
        dispatch(projectOpened(dataProject.project));
    } catch (error) {
        dispatch(detailRequestFailed(toErrorPayload(error).msg));
    }
};
