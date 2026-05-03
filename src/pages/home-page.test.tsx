import {act, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from './home-page';
import {renderWithProviders} from '../test-utils/render';
import type {Quest} from '../components/quest-card';

const fetchQuestsAction = vi.fn(() => ({type: 'quests/fetch'}));

vi.mock('../store/quests-slice', async () => {
  const actual = await vi.importActual<typeof import('../store/quests-slice')>('../store/quests-slice');
  return {...actual, fetchQuestsAction: () => fetchQuestsAction()};
});

const makeQuest = (id: string, theme: Quest['theme'], difficulty: Quest['difficulty']): Quest => ({
  id,
  title: `Quest ${id}`,
  theme,
  difficulty,
  minPeople: 2,
  maxPeople: 4,
  description: '',
  imageWebp: '/img/q.webp',
  imageJpg: '/img/q.jpg',
  imageJpg2x: '/img/q@2x.jpg',
  backgroundImageJpg: '/img/bg.jpg',
  alt: `Quest ${id}`,
});

describe('HomePage', () => {
  it('renders loading state', () => {
    renderWithProviders(<HomePage />, {
      preloadedState: {
        quests: {quests: [], status: 'loading', error: null, theme: 'all', difficulty: 'any'},
      },
    });

    expect(screen.getByText('Загрузка квестов...')).toBeInTheDocument();
  });

  it('filters quests by theme and difficulty', async () => {
    const quests = [
      makeQuest('1', 'mystic', 'easy'),
      makeQuest('2', 'horror', 'hard'),
    ];

    act(() => {
      renderWithProviders(<HomePage />, {
        preloadedState: {
          quests: {quests, status: 'success', error: null, theme: 'all', difficulty: 'any'},
        },
      });
    });

    expect(screen.getByText('Quest 1')).toBeInTheDocument();
    expect(screen.getByText('Quest 2')).toBeInTheDocument();

    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByLabelText('Мистика'));
    });

    expect(screen.getByText('Quest 1')).toBeInTheDocument();
    expect(screen.queryByText('Quest 2')).not.toBeInTheDocument();

    await act(async () => {
      await user.click(screen.getByLabelText('Сложный'));
    });
    expect(screen.getByText('По выбранным фильтрам квестов не найдено.')).toBeInTheDocument();
  });
});

