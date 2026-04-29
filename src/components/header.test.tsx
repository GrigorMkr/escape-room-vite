import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from './header';
import {renderWithProviders} from '../test-utils/render';

describe('Header', () => {
  it('shows login link when not authorized', () => {
    renderWithProviders(<Header isAuthorized={false} onLogout={vi.fn()} />);

    expect(screen.getByRole('link', {name: 'Вход'})).toHaveAttribute('href', '/login');
    expect(screen.queryByRole('button', {name: 'Выйти'})).not.toBeInTheDocument();
  });

  it('shows logout button and my bookings link when authorized', async () => {
    const onLogout = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<Header isAuthorized onLogout={onLogout} />);

    expect(screen.getByRole('link', {name: 'Мои бронирования'})).toHaveAttribute('href', '/my-quests');
    await user.click(screen.getByRole('button', {name: 'Выйти'}));
    expect(onLogout).toHaveBeenCalled();
  });
});

