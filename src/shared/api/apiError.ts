export type ApiFieldError = {
    field: string;
    msg: string;
};

export type ApiErrorBody = {
    msg: string;
    errors?: ApiFieldError[];
};

// status 0 se reserva para fallos de red: la petición nunca llegó a la API
export const NETWORK_ERROR_STATUS = 0;

export class ApiError extends Error {
    status: number;
    msg: string;
    errors: ApiFieldError[];

    constructor(status: number, msg: string, errors: ApiFieldError[] = []) {
        super(msg);
        this.name = 'ApiError';
        this.status = status;
        this.msg = msg;
        this.errors = errors;
    }

    get isNetworkError(): boolean {
        return this.status === NETWORK_ERROR_STATUS;
    }

    get isValidationError(): boolean {
        return this.status === 400 && this.errors.length > 0;
    }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

export type ApiErrorPayload = {
    status: number;
    msg: string;
    errors: ApiFieldError[];
};

// Los thunks no pueden guardar una Error en el store: tiene que ser serializable
export const toErrorPayload = (error: unknown): ApiErrorPayload =>
    isApiError(error)
        ? { status: error.status, msg: error.msg, errors: error.errors }
        : { status: NETWORK_ERROR_STATUS, msg: 'Ocurrió un error inesperado', errors: [] };
