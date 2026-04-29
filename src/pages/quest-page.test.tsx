import {screen} from '@testing-library/react';
import {Route, Routes} from 'react-router-dom';
import QuestPage from './quest-page';
import {renderWithProviders} from '../test-utils/render';
import type {QuestDetailResponse} from '../services/quests-api';
import {ApiError} from '../services/api-client';

const getQuest = vi.fn<[string], Promise<QuestDetailResponse>>();

vi.mock('../services/quests-api', async () => {
  const actual = await vi.importActual<typeof import('../services/quests-api')>('../services/quests-api');
  return {...actual, getQuest: (id: string) => getQuest(id)};
});

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

describe('QuestPage', () => {
  beforeEach(() => {
    getQuest.mockReset();
  });

  it('renders quest details and booking link', async () => {
    getQuest.mockResolvedValueOnce(quest);

    renderWithProviders(
      <Routes>
        <Route path="/quest/:id" element={<QuestPage />} />
      </Routes>,
      {route: '/quest/q1'}
    );

    expect(await screen.findByRole('heading', {name: 'Quest 1'})).toBeInTheDocument();
    expect(screen.getByText('Мистика')).toBeInTheDocument();
    expect(screen.getByText('2-4 чел')).toBeInTheDocument();

    const booking = screen.getByRole('link', {name: 'Забронировать'});
    expect(booking).toHaveAttribute('href', '/quest/q1/booking');
  });

  it('redirects to /404 when API returns 404', async () => {
    getQuest.mockRejectedValueOnce(new ApiError('Not found', 404));

    renderWithProviders(
      <Routes>
        <Route path="/quest/:id" element={<QuestPage />} />
        <Route path="/404" element={<div>Not found</div>} />
      </Routes>,
      {route: '/quest/missing'}
    );

    expect(await screen.findByText('Not found')).toBeInTheDocument();
  });
});

