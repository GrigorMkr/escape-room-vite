import {API_BASE_URL, TOKEN_HEADER_NAME, TOKEN_STORAGE_KEY} from '../constants/api';

class ApiError extends Error {
  status: number;
  errorType?: string;

  constructor(message: string, status: number, errorType?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorType = errorType;
  }
}

const getStoredToken = (): string | null => localStorage.getItem(TOKEN_STORAGE_KEY);

type RequestOptions = {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  token?: string | null;
  tokenRequired?: boolean;
};

const safeJsonParse = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
};

const getMessageFromErrorBody = (body: unknown): string | undefined => {
  if (!body || typeof body !== 'object') {
    return undefined;
  }
  const record = body as Record<string, unknown>;
  const msg = record.message;
  return typeof msg === 'string' ? msg : undefined;
};

const isNetworkError = (err: unknown): boolean => {
  if (!err || typeof err !== 'object') {
    return false;
  }
  const e = err as {name?: unknown};
  return e.name === 'TypeError';
};

const requestJson = async <TResponse>(
  path: string,
  {method = 'GET', body, token = null, tokenRequired = false}: RequestOptions = {}
): Promise<TResponse> => {
  const url = `${API_BASE_URL}${path}`;

  if (tokenRequired && !token) {
    throw new ApiError('Необходимо выполнить авторизацию.', 401, 'AUTH_REQUIRED');
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers[TOKEN_HEADER_NAME] = token;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (isNetworkError(err)) {
      throw new ApiError('Сервер временно недоступен. Попробуйте позже.', 0, 'NETWORK_ERROR');
    }
    throw err;
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const data = await safeJsonParse(response);

  if (!response.ok) {
    const message = getMessageFromErrorBody(data) ?? `Ошибка запроса (${response.status}).`;
    const errorType = typeof data === 'object' && data && 'errorType' in (data as Record<string, unknown>)
      ? String((data as Record<string, unknown>).errorType)
      : undefined;
    throw new ApiError(message, response.status, errorType);
  }

  return data as TResponse;
};

export {ApiError, getStoredToken, requestJson};
export type {RequestOptions};

