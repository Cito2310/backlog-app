import { apiDelete, apiGet, apiPost, toErrorPayload } from '@/shared/api';
import type { AppDispatch } from '@/store/store';
import type { CreateProjectBody, ProjectResponse, ProjectsResponse } from '@/types/project';
import {
    projectCreated,
    projectRemoved,
    projectsLoaded,
    projectsRequestFailed,
    projectsRequestStarted,
} from './projectsSlice';

// Se relanza el error original para que el formulario pueda leer errors[] y marcar el campo
// exacto. El store solo se queda con el mensaje, que es para el cartel
const fail = (dispatch: AppDispatch, error: unknown): never => {
    dispatch(projectsRequestFailed(toErrorPayload(error).msg));
    throw error;
};

export const fetchProjects = () => async (dispatch: AppDispatch) => {
    dispatch(projectsRequestStarted());
    try {
        const dataProjects = await apiGet<ProjectsResponse>('/backlog-app/projects');
        dispatch(projectsLoaded(dataProjects.projects));
    } catch (error) {
        fail(dispatch, error);
    }
};

export const createProject =
    ({ name, description }: CreateProjectBody) =>
    async (dispatch: AppDispatch) => {
        dispatch(projectsRequestStarted());
        try {
            const dataProject = await apiPost<ProjectResponse>('/backlog-app/projects', {
                name: name.trim(),
                description: description?.trim() ?? '',
            });
            dispatch(projectCreated(dataProject.project));
        } catch (error) {
            fail(dispatch, error);
        }
    };

// La baja es lógica: el proyecto queda con active false y libera su nombre
export const deleteProject = (id: string) => async (dispatch: AppDispatch) => {
    dispatch(projectsRequestStarted());
    try {
        await apiDelete(`/backlog-app/projects/${id}`);
        dispatch(projectRemoved(id));
    } catch (error) {
        fail(dispatch, error);
    }
};
