import {ApiError, getStoredToken, requestJson} from './api-client';
import {TOKEN_STORAGE_KEY} from '../constants/api';

type LoginResponse = {
  email: string;
  token: string;
};

const login = async (email: string, password: string): Promise<string> => {
  const response = await requestJson<LoginResponse>('/login', {
    method: 'POST',
    body: {email, password},
  });

  return response.token;
};

const checkAuth = async (): Promise<boolean> => {
  const token = getStoredToken();
  if (!token) {
    return false;
  }

  try {
    await requestJson<LoginResponse>('/login', {
      method: 'GET',
      token,
      tokenRequired: true,
    });
    return true;
  } catch (err) {
    if (err instanceof ApiError) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return false;
    }
    return false;
  }
};

const logout = async (): Promise<void> => {
  const token = getStoredToken();
  if (!token) {
    return;
  }

  await requestJson<void>('/logout', {
    method: 'DELETE',
    token,
    tokenRequired: true,
  });

  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export {checkAuth, login, logout, setToken};

