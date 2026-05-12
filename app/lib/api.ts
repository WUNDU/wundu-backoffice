import axios from "axios";

const API_BASE_URL = "/api/proxy";

export type ApiError = Error & {
  errorCode?: string;
  status?: number;
  retryAfterSeconds?: number;
};

// Registered by auth-store after creation — breaks circular dep without require()
let _getToken: (() => string | null) | null = null;
let _doRefresh: (() => Promise<string>) | null = null;
let _doLogout: (() => void) | null = null;

export function setAuthHandlers(
  getToken: () => string | null,
  doRefresh: () => Promise<string>,
  doLogout: () => void
) {
  _getToken = getToken;
  _doRefresh = doRefresh;
  _doLogout = doLogout;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

// Inject token from auth store (in-memory only — never from localStorage)
api.interceptors.request.use((config) => {
  const token = _getToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Queue of requests waiting for silent token refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

// Response interceptor: silent refresh on 401, global error normalisation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isCancel(error) || error?.name === "AbortError" || error?.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth")
    ) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await _doRefresh!();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        _doLogout?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const fallbackMessage = "Não foi possível conectar ao serviço. Tente novamente.";
    const rawMessage =
      error.response?.data?.message || error.message || error.response?.statusText;
    const message =
      rawMessage && rawMessage !== "Internal Server Error" ? rawMessage : fallbackMessage;

    const err = new Error(message) as ApiError;
    err.errorCode = error.response?.data?.errorCode;
    err.status = error.response?.status;
    err.retryAfterSeconds = error.response?.data?.retryAfterSeconds;

    return Promise.reject(err);
  }
);

type ApiConfig = {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  withCredentials?: boolean;
};

class ApiClient {
  get<T = unknown>(path: string, config?: ApiConfig) {
    return api.get<T>(path, config);
  }
  post<T = unknown>(path: string, body?: unknown, config?: ApiConfig) {
    return api.post<T>(path, body, config);
  }
  put<T = unknown>(path: string, body?: unknown, config?: ApiConfig) {
    return api.put<T>(path, body, config);
  }
  patch<T = unknown>(path: string, body?: unknown, config?: ApiConfig) {
    return api.patch<T>(path, body, config);
  }
  delete<T = unknown>(path: string, config?: ApiConfig) {
    return api.delete<T>(path, config);
  }
}

export const apiClient = new ApiClient();

