import { authCleared } from '@/features/auth/authSlice';
import { projectsCleared } from '@/features/projects/projectsSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';

export const useNavbar = () => {
    const dispatch = useAppDispatch();
    const username = useAppSelector((state) => state.auth.user?.username ?? '');

    const logout = () => {
        dispatch(authCleared());
        dispatch(projectsCleared());
    };

    return { username, logout };
};
