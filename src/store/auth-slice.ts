import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {checkAuth, login as loginUser, logout as logoutUser} from '../services/auth-api';
import {TOKEN_STORAGE_KEY} from '../constants/api';

type AuthState = {
  isAuthorized: boolean;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
};

const initialState: AuthState = {
  isAuthorized: !!localStorage.getItem(TOKEN_STORAGE_KEY),
  status: 'idle',
  error: null,
};

const checkAuthAction = createAsyncThunk<boolean>(
  'auth/check',
  async () => await checkAuth()
);

const loginAction = createAsyncThunk<
  void,
  {email: string; password: string}
>(
  'auth/login',
  async ({email, password}) => {
    const token = await loginUser(email, password);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
);

const logoutAction = createAsyncThunk<void>(
  'auth/logout',
  async () => {
    try {
      await logoutUser();
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthAction.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(checkAuthAction.fulfilled, (state, action) => {
        state.status = 'success';
        state.isAuthorized = action.payload;
      })
      .addCase(checkAuthAction.rejected, (state) => {
        state.status = 'error';
        state.isAuthorized = false;
        state.error = 'Не удалось проверить авторизацию.';
      })
      .addCase(loginAction.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginAction.fulfilled, (state) => {
        state.status = 'success';
        state.isAuthorized = true;
      })
      .addCase(loginAction.rejected, (state, action) => {
        state.status = 'error';
        state.isAuthorized = false;
        state.error = action.error.message ?? 'Не удалось выполнить вход.';
      })
      .addCase(logoutAction.fulfilled, (state) => {
        state.status = 'success';
        state.isAuthorized = false;
        state.error = null;
      })
      .addCase(logoutAction.rejected, (state) => {
        state.status = 'error';
        state.isAuthorized = false;
        state.error = 'Не удалось выйти из аккаунта.';
      });
  },
});

export default authSlice.reducer;

export {checkAuthAction, loginAction, logoutAction};

