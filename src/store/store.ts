import { combineSlices, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { authSlice } from '@/features/auth/authSlice';
import { projectDetailSlice } from '@/features/project-detail/projectDetailSlice';
import { projectsSlice } from '@/features/projects/projectsSlice';

const rootReducer = combineSlices(authSlice, projectsSlice, projectDetailSlice);

export const store = configureStore({
    reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
