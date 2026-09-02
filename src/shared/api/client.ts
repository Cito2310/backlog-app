import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './env';
import { ApiError, NETWORK_ERROR_STATUS } from './apiError';
import type { ApiErrorBody } from './apiError';

type TokenProvider = () => string | null;
type UnauthorizedHandler = () => void;

let provideToken: TokenProvider = () => null;
let handleUnauthorized: UnauthorizedHandler = () => {};

// La feature de auth se registra acá: así el cliente no depende del store ni del storage
export const setTokenProvider = (provider: TokenProvider) => {
    provideToken = provider;
};

export const setUnauthorizedHandler = (handler: UnauthorizedHandler) => {
    handleUnauthorized = handler;
};

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = provideToken();
    if (token) config.headers.set('token', token);
    return config;
});

const toApiError = (error: AxiosError<ApiErrorBody>): ApiError => {
    const body = error.response?.data;

    if (!error.response) {
        return new ApiError(NETWORK_ERROR_STATUS, 'No se pudo conectar con la API');
    }

    return new ApiError(
        error.response.status,
        body?.msg ?? 'Ocurrió un error inesperado',
        body?.errors ?? [],
    );
};

// Solo estos msg significan "la sesión ya no sirve". Un 401 invalid credentials es una
// contraseña mal escrita en login o en /auth/me, y no debe desloguear a nadie
const SESSION_EXPIRED_MESSAGES = ['token needed', 'invalid token', 'user is inactive'];

const isSessionExpired = (error: ApiError): boolean =>
    (error.status === 401 || error.status === 403) && SESSION_EXPIRED_MESSAGES.includes(error.msg);

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorBody>) => {
        const apiError = toApiError(error);
        if (isSessionExpired(apiError)) handleUnauthorized();
        return Promise.reject(apiError);
    },
);

export const apiGet = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const { data } = await api.get<T>(url, config);
    return data;
};

export const apiPost = async <T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
): Promise<T> => {
    const { data } = await api.post<T>(url, body, config);
    return data;
};

export const apiPatch = async <T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
): Promise<T> => {
    const { data } = await api.patch<T>(url, body, config);
    return data;
};

export const apiDelete = async <T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
): Promise<T> => {
    const { data } = await api.delete<T>(url, { ...config, data: body });
    return data;
};
