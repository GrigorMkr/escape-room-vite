import {act, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyBookingsPage from './my-bookings-page';
import {renderWithProviders} from '../test-utils/render';
import {TOKEN_STORAGE_KEY} from '../constants/api';
import type {BookingRecord} from '../services/bookings-api';

const getMyBookings = vi.fn<[], Promise<BookingRecord[]>>();
const cancelBooking = vi.fn<[string], Promise<void>>();

vi.mock('../services/bookings-api', async () => {
  const actual = await vi.importActual<typeof import('../services/bookings-api')>('../services/bookings-api');
  return {
    ...actual,
    getMyBookings: () => getMyBookings(),
    cancelBooking: (id: string) => cancelBooking(id),
  };
});

const makeBooking = (id: string): BookingRecord => ({
  id,
  date: 'today',
  time: '12:00',
  contactPerson: 'Test',
  phone: '89000000000',
  withChildren: false,
  peopleCount: 2,
  location: {
    address: 'Test address',
    coords: [59.9386, 30.3141],
  },
  quest: {
    id: 'q1',
    title: 'Quest 1',
    previewImg: '/img/q.jpg',
    previewImgWebp: '/img/q.webp',
    level: 'easy',
    type: 'mystic',
    peopleMinMax: [2, 4],
  },
});

describe('MyBookingsPage', () => {
  beforeEach(() => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'token');
    getMyBookings.mockReset();
    cancelBooking.mockReset();
  });

  it('shows empty state when no bookings', async () => {
    getMyBookings.mockResolvedValueOnce([]);

    await act(async () => {
      renderWithProviders(<MyBookingsPage />, {
        preloadedState: {auth: {isAuthorized: true, status: 'success', error: null}},
      });
    });

    expect(await screen.findByText('У вас пока нет бронирований.')).toBeInTheDocument();
  });

  it('renders bookings and allows cancelling', async () => {
    getMyBookings.mockResolvedValueOnce([makeBooking('b1'), makeBooking('b2')]);
    let resolveCancel: () => void = () => undefined;
    cancelBooking.mockImplementationOnce(() => new Promise<void>((resolve) => {
      resolveCancel = () => resolve();
    }));

    await act(async () => {
      renderWithProviders(<MyBookingsPage />, {
        preloadedState: {auth: {isAuthorized: true, status: 'success', error: null}},
      });
    });

    expect(await screen.findAllByRole('link', {name: 'Quest 1'})).toHaveLength(2);

    const cancelButtons = await screen.findAllByRole('button', {name: 'Отменить'});
    expect(cancelButtons).toHaveLength(2);

    const user = userEvent.setup();
    await act(async () => {
      await user.click(cancelButtons[0]);
    });

    expect(cancelBooking).toHaveBeenCalledWith('b1');
    expect(await screen.findByRole('button', {name: 'Отмена...'})).toBeDisabled();

    await act(async () => {
      resolveCancel();
    });

    await waitFor(() => {
      expect(screen.getAllByRole('link', {name: 'Quest 1'})).toHaveLength(1);
    });
  });
});

