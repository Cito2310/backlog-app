import { apiGet, apiPost, toErrorPayload } from '@/shared/api';
import { readItem } from '@/shared/api/localStorage';
import { STORAGE_KEYS } from '@/shared/api/storageKeys';
import type { AppDispatch } from '@/store/store';
import type {
    AuthBody,
    LoginResponse,
    MeResponse,
    RegisterResponse,
    StoredAuth,
} from '@/types/auth';
import {
    authCleared,
    authLoaded,
    authRequestFailed,
    authRequestStarted,
    authRestored,
    userRefreshed,
} from './authSlice';

// La API recorta y pasa a minúsculas igual, pero si no lo hacemos acá el usuario escribe
// "Cito", le vuelve invalid credentials y no entiende por qué
const normalizeUsername = (username: string): string => username.trim().toLowerCase();

// Se relanza el error original para que el formulario pueda leer errors[] y marcar el campo
// exacto. El store solo se queda con el mensaje, que es para el cartel
const fail = (dispatch: AppDispatch, error: unknown): never => {
    dispatch(authRequestFailed(toErrorPayload(error).msg));
    throw error;
};

const isStoredAuth = (value: unknown): value is StoredAuth => {
    if (typeof value !== 'object' || value === null) return false;
    const candidate = value as Partial<StoredAuth>;
    return typeof candidate.token === 'string' && typeof candidate.user?._id === 'string';
};

export const login =
    ({ username, password }: AuthBody) =>
    async (dispatch: AppDispatch) => {
        dispatch(authRequestStarted());
        try {
            const dataLogin = await apiPost<LoginResponse>('/auth/login', {
                username: normalizeUsername(username),
                password,
            });
            dispatch(authLoaded(dataLogin));
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
                username: normalizeUsername(username),
                password,
            });
            dispatch(authLoaded(dataRegister));
        } catch (error) {
            fail(dispatch, error);
        }
    };

// Revalida en segundo plano: no toca status ni error. Si el token murió, el interceptor ya
// despachó authCleared; si fue la red, nadie debería quedar afuera por estar sin internet
export const refreshUser = () => async (dispatch: AppDispatch) => {
    try {
        const dataMe = await apiGet<MeResponse>('/auth/me');
        dispatch(userRefreshed(dataMe.user));
    } catch {
        // silencioso a propósito
    }
};

// Optimista: pinta con lo guardado y verifica después. El localStorage sirve para aparecer
// rápido, /auth/me es la verdad
export const loadUserByLocalStorage = () => async (dispatch: AppDispatch) => {
    const stored = readItem(STORAGE_KEYS.auth, isStoredAuth);

    // Sin sesión guardada hay que despachar igual: es lo que saca a status de uninitialized
    if (!stored) {
        dispatch(authCleared());
        return;
    }

    dispatch(authRestored(stored));
    await dispatch(refreshUser());
};
