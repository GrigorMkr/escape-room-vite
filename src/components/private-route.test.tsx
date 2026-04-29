import {screen} from '@testing-library/react';
import {Route, Routes} from 'react-router-dom';
import PrivateRoute from './private-route';
import {renderWithProviders} from '../test-utils/render';

describe('PrivateRoute', () => {
  it('redirects to /login when not authorized', async () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/secret"
          element={(
            <PrivateRoute isAuthorized={false}>
              <div>Secret</div>
            </PrivateRoute>
          )}
        />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>,
      {route: '/secret'}
    );

    expect(await screen.findByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('renders children when authorized', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/secret"
          element={(
            <PrivateRoute isAuthorized>
              <div>Secret</div>
            </PrivateRoute>
          )}
        />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>,
      {route: '/secret'}
    );

    expect(screen.getByText('Secret')).toBeInTheDocument();
  });
});

