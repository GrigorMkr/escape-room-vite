import {screen} from '@testing-library/react';
import QuestList from './quest-list';
import type {Quest} from './quest-card';
import {renderWithProviders} from '../test-utils/render';

const quests: Quest[] = [
  {
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
  },
  {
    id: 'q2',
    title: 'Quest 2',
    theme: 'horror',
    difficulty: 'hard',
    minPeople: 2,
    maxPeople: 5,
    description: '',
    imageWebp: '/img/q.webp',
    imageJpg: '/img/q.jpg',
    imageJpg2x: '/img/q@2x.jpg',
    backgroundImageJpg: '/img/bg.jpg',
    alt: 'Quest 2',
  },
];

describe('QuestList', () => {
  it('renders cards grid', () => {
    renderWithProviders(<QuestList quests={quests} />);
    expect(screen.getByText('Quest 1')).toBeInTheDocument();
    expect(screen.getByText('Quest 2')).toBeInTheDocument();
  });
});

