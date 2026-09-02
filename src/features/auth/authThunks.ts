import { apiGet, apiPost, toErrorPayload } from '@/shared/api';
import type { AppDispatch } from '@/store/store';
import type { AuthBody, LoginResponse, MeResponse, RegisterResponse } from '@/types/auth';
import {
    authRequestFailed,
    authRequestStarted,
    loadUser,
    refreshUser as userRefreshed,
} from './authSlice';

const fail = (dispatch: AppDispatch, error: unknown): never => {
    dispatch(authRequestFailed(toErrorPayload(error).msg));
    throw error;
};

export const login =
    ({ username, password }: AuthBody) =>
    async (dispatch: AppDispatch) => {
        dispatch(authRequestStarted());
        try {
            const dataLogin = await apiPost<LoginResponse>('/auth/login', {
                username: username.trim().toLowerCase(),
                password,
            });
            dispatch(loadUser(dataLogin));
        } catch (error) {
            fail(dispatch, error);
        }
    };

export const register =
    ({ username, password }: AuthBody) =>
    async (dispatch: AppDispatch) => {
        dispatch(authRequestStarted());
        try {
            const dataRegister = await apiPost<RegisterResponse>('/auth/register', {
                username: username.trim().toLowerCase(),
                password,
            });
            dispatch(loadUser(dataRegister));
        } catch (error) {
            fail(dispatch, error);
        }
    };

export const refreshUser = () => async (dispatch: AppDispatch) => {
    try {
        const dataMe = await apiGet<MeResponse>('/auth/me');
        dispatch(userRefreshed(dataMe.user));
    } catch {
        // silencioso a propósito
    }
};
