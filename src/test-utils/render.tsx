import {configureStore} from '@reduxjs/toolkit';
import {render} from '@testing-library/react';
import {type PropsWithChildren} from 'react';
import {Provider} from 'react-redux';
import {MemoryRouter} from 'react-router-dom';
import authReducer from '../store/auth-slice';
import questsReducer from '../store/quests-slice';
import type {RootState} from '../store/store';

type RenderOptions = {
  route?: string;
  preloadedState?: Partial<RootState>;
};

const renderWithProviders = (ui: JSX.Element, {route = '/', preloadedState}: RenderOptions = {}) => {
  const store = configureStore({
    reducer: {auth: authReducer, quests: questsReducer},
    preloadedState: preloadedState as RootState | undefined,
  });

  const Wrapper = ({children}: PropsWithChildren) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        {children}
      </MemoryRouter>
    </Provider>
  );

  return {store, ...render(ui, {wrapper: Wrapper})};
};

export {renderWithProviders};
