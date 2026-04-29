import {configureStore} from '@reduxjs/toolkit';
import authReducer from './auth-slice';
import questsReducer from './quests-slice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    quests: questsReducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export {store};
export type {AppDispatch, RootState};
