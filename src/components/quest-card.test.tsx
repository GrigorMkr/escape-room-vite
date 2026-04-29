import {screen} from '@testing-library/react';
import QuestCard, {type Quest} from './quest-card';
import {renderWithProviders} from '../test-utils/render';

const quest: Quest = {
  id: 'q1',
  title: 'Quest 1',
  theme: 'mystic',
  difficulty: 'easy',
  minPeople: 2,
  maxPeople: 4,
  description: '',
  imageWebp: '/img/q.webp',
  imageJpg: '/img/q.jpg',
  imageJpg2x: '/img/q@2x.jpg',
  backgroundImageJpg: '/img/bg.jpg',
  alt: 'Quest 1',
};

describe('QuestCard', () => {
  it('renders quest info and link', () => {
    renderWithProviders(<QuestCard quest={quest} />);
    expect(screen.getByText('Quest 1')).toBeInTheDocument();
    expect(screen.getByText('2-4 чел')).toBeInTheDocument();
    expect(screen.getByText('Простой')).toBeInTheDocument();

    expect(screen.getByRole('link')).toHaveAttribute('href', '/quest/q1');
    expect(screen.getByRole('img', {name: 'Quest 1'})).toBeInTheDocument();
  });
});

