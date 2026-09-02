const rawBaseUrl = import.meta.env.VITE_API_URL;

if (!rawBaseUrl) {
    throw new Error('Falta VITE_API_URL. Copiá .env.example a .env y completá la URL de la API.');
}

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');
