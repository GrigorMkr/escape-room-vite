import {act, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Route, Routes} from 'react-router-dom';
import LoginPage from './login-page';
import {renderWithProviders} from '../test-utils/render';

describe('LoginPage', () => {
  it('validates empty fields', async () => {
    const onLogin = vi.fn();
    const user = userEvent.setup();

    await act(async () => {
      renderWithProviders(
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={onLogin} isAuthorized={false} />} />
        </Routes>,
        {route: '/login'}
      );
    });

    await act(async () => {
      await user.click(screen.getByRole('button', {name: 'Войти'}));
    });

    expect(await screen.findByRole('alert')).toHaveTextContent('Логин (email) не может быть пустым.');
    expect(screen.getByRole('alert')).toHaveTextContent('Пароль не может быть пустым.');
    expect(onLogin).not.toHaveBeenCalled();
  });

  it('submits and navigates to from-path', async () => {
    const onLogin = vi.fn().mockResolvedValueOnce(undefined);
    const user = userEvent.setup();

    await act(async () => {
      renderWithProviders(
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={onLogin} isAuthorized={false} />} />
          <Route path="/contacts" element={<div>Contacts</div>} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>,
        {route: '/login'}
      );
    });

    await act(async () => {
      await user.type(screen.getByLabelText(/mail/i), 'user@example.com');
      await user.type(screen.getByLabelText('Пароль'), 'a1b');
    });

    await act(async () => {
      await user.click(screen.getByRole('button', {name: 'Войти'}));
    });

    expect(onLogin).toHaveBeenCalledWith('user@example.com', 'a1b');
  });
});

