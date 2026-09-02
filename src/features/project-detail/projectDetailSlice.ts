import type { Project } from '@/types/project';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type Status = 'uninitialized' | 'ok' | 'loading' | 'failed' | 'success';

type ProjectDetailState = {
    current: Project | null;
    status: Status;
    error: string | null;
};

const initialState: ProjectDetailState = {
    current: null,
    status: 'uninitialized',
    error: null,
};

export const projectDetailSlice = createSlice({
    name: 'projectDetail',
    initialState,
    reducers: {
        detailRequestStarted: (state) => {
            state.status = 'loading';
            state.error = null;
        },

        detailRequestFailed: (state, action: PayloadAction<string>) => {
            state.status = 'failed';
            state.error = action.payload;
        },

        // Trae el árbol completo con su __v, que es lo que habilita editar
        projectOpened: (state, action: PayloadAction<Project>) => {
            state.current = action.payload;
            state.status = 'ok';
            state.error = null;
        },

        // Al salir del detalle: si no, al abrir otro proyecto se vería el anterior mientras carga
        projectClosed: () => initialState,
    },
});

export const { detailRequestFailed, detailRequestStarted, projectClosed, projectOpened } =
    projectDetailSlice.actions;
