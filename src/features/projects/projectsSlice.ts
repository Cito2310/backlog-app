import type { ProjectSummary } from '@/types/project';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type Status = 'uninitialized' | 'ok' | 'loading' | 'failed' | 'success';

type ProjectsState = {
    list: ProjectSummary[];
    status: Status;
    error: string | null;
};

const initialState: ProjectsState = {
    list: [],
    status: 'uninitialized',
    error: null,
};

export const projectsSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        projectsRequestStarted: (state) => {
            state.status = 'loading';
            state.error = null;
        },

        projectsRequestFailed: (state, action: PayloadAction<string>) => {
            state.status = 'failed';
            state.error = action.payload;
        },

        projectsLoaded: (state, action: PayloadAction<ProjectSummary[]>) => {
            state.list = action.payload;
            state.status = 'ok';
            state.error = null;
        },

        // La API ordena por updatedAt descendente, así que el nuevo va primero
        projectCreated: (state, action: PayloadAction<ProjectSummary>) => {
            state.list.unshift(action.payload);
            state.status = 'success';
            state.error = null;
        },

        projectRemoved: (state, action: PayloadAction<string>) => {
            state.list = state.list.filter((project) => project._id !== action.payload);
            state.status = 'success';
            state.error = null;
        },

        // Al cerrar sesión: si no, el próximo usuario ve la lista del anterior
        projectsCleared: () => initialState,
    },
});

export const {
    projectCreated,
    projectRemoved,
    projectsCleared,
    projectsLoaded,
    projectsRequestFailed,
    projectsRequestStarted,
} = projectsSlice.actions;
