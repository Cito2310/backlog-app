import type { StorageKey } from './storageKeys';

type Validator<T> = (value: unknown) => value is T;

export const readItem = <T>(key: StorageKey, isValid?: Validator<T>): T | null => {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return null;

        const parsed: unknown = JSON.parse(raw);

        if (isValid && !isValid(parsed)) {
            localStorage.removeItem(key);
            return null;
        }

        return parsed as T;
    } catch {
        return null;
    }
};

export const writeItem = <T>(key: StorageKey, value: T): boolean => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
};

export const removeItem = (key: StorageKey): void => {
    try {
        localStorage.removeItem(key);
    } catch {
        // sin storage no hay nada que borrar
    }
};

export const hasItem = (key: StorageKey): boolean => {
    try {
        return localStorage.getItem(key) !== null;
    } catch {
        return false;
    }
};
