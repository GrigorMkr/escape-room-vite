import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Route, Routes} from 'react-router-dom';
import BookingPage from './booking-page';
import {renderWithProviders} from '../test-utils/render';
import {TOKEN_STORAGE_KEY} from '../constants/api';
import type {BookingPlace} from '../types/booking';
import type {QuestDetailResponse} from '../services/quests-api';

const getQuest = vi.fn<[string], Promise<QuestDetailResponse>>();
const getQuestBookingPlaces = vi.fn<[string], Promise<BookingPlace[]>>();
const createBooking = vi.fn<[string, unknown], Promise<void>>();

vi.mock('../services/quests-api', async () => {
  const actual = await vi.importActual<typeof import('../services/quests-api')>('../services/quests-api');
  return {...actual, getQuest: (id: string) => getQuest(id)};
});

vi.mock('../services/bookings-api', async () => {
  const actual = await vi.importActual<typeof import('../services/bookings-api')>('../services/bookings-api');
  return {
    ...actual,
    getQuestBookingPlaces: (id: string) => getQuestBookingPlaces(id),
    createBooking: (id: string, body: unknown) => createBooking(id, body),
  };
});

vi.mock('../components/booking-map', () => ({
  default: ({places, selectedPlaceId, onSelectPlace}: {
    places: BookingPlace[];
    selectedPlaceId: string;
    onSelectPlace: (placeId: string) => void;
  }) => (
    <div>
      <div data-testid="selected-place">{selectedPlaceId}</div>
      {places.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onSelectPlace(p.id)}
        >
          {p.address}
        </button>
      ))}
    </div>
  ),
}));

const quest: QuestDetailResponse = {
  id: 'q1',
  title: 'Quest 1',
  previewImg: '/img/q.jpg',
  previewImgWebp: '/img/q.webp',
  level: 'easy',
  type: 'mystic',
  peopleMinMax: [2, 4],
  description: 'Desc',
  coverImg: '/img/c.jpg',
  coverImgWebp: '/img/c.webp',
};

const places: BookingPlace[] = [
  {
    id: 'p1',
    address: 'A1',
    coords: [59.9, 30.3],
    slots: [
      {id: 'today-12:00-p1', day: 'today', time: '12:00', isAvailable: true},
      {id: 'today-13:00-p1', day: 'today', time: '13:00', isAvailable: false},
    ],
  },
  {
    id: 'p2',
    address: 'A2',
    coords: [59.92, 30.32],
    slots: [
      {id: 'today-14:00-p2', day: 'today', time: '14:00', isAvailable: true},
    ],
  },
];

describe('BookingPage', () => {
  beforeEach(() => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'token');
    getQuest.mockReset();
    getQuestBookingPlaces.mockReset();
    createBooking.mockReset();
  });

  it('formats phone on blur and submits booking', async () => {
    getQuest.mockResolvedValueOnce(quest);
    getQuestBookingPlaces.mockResolvedValueOnce(places);
    createBooking.mockResolvedValueOnce();

    renderWithProviders(
      <Routes>
        <Route path="/quest/:id/booking" element={<BookingPage />} />
        <Route path="/my-quests" element={<div>My bookings</div>} />
      </Routes>,
      {
        route: '/quest/q1/booking',
        preloadedState: {auth: {isAuthorized: true, status: 'success', error: null}},
      }
    );

    await screen.findByText('Бронирование квеста');

    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Ваше имя'), 'Иван');

    const tel = screen.getByLabelText('Контактный телефон');
    await user.type(tel, '+79871484032');
    await user.tab();
    expect(tel).toHaveValue('+7 (987) 148-40-32');

    const agreement = screen.getByRole('checkbox', {name: /Я\s+согласен/i});
    await user.click(agreement);

    await user.click(screen.getByRole('button', {name: 'Забронировать'}));

    expect(createBooking).toHaveBeenCalled();
    expect(await screen.findByText('My bookings')).toBeInTheDocument();
  });

  it('redirects to /login when rendered behind PrivateRoute', async () => {
    getQuest.mockResolvedValueOnce(quest);
    getQuestBookingPlaces.mockResolvedValueOnce(places);

    const {default: PrivateRoute} = await import('../components/private-route');
    const Login = () => <div>Login</div>;

    renderWithProviders(
      <Routes>
        <Route
          path="/quest/:id/booking"
          element={(
            <PrivateRoute isAuthorized={false}>
              <BookingPage />
            </PrivateRoute>
          )}
        />
        <Route path="/login" element={<Login />} />
      </Routes>,
      {route: '/quest/q1/booking'}
    );

    expect(await screen.findByText('Login')).toBeInTheDocument();
  });
});

