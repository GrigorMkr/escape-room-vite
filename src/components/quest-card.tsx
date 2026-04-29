import {memo} from 'react';
import {Link} from 'react-router-dom';
import {QUEST_CARD_IMAGE_SIZE} from '../constants/ui';

type Quest = {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  theme: 'adventure' | 'horror' | 'mystic' | 'detective' | 'sci-fi';
  minPeople: number;
  maxPeople: number;
  description: string;
  imageWebp: string;
  imageWebp2x?: string;
  imageJpg: string;
  imageJpg2x: string;
  backgroundImageJpg: string;
  alt: string;
};

type QuestCardProps = {
  quest: Quest;
};

const QuestCard = ({quest}: QuestCardProps) => {
  let difficultyLabel = '';
  switch (quest.difficulty) {
    case 'easy':
      difficultyLabel = 'Простой';
      break;
    case 'medium':
      difficultyLabel = 'Средний';
      break;
    case 'hard':
      difficultyLabel = 'Сложный';
      break;
    default:
      difficultyLabel = quest.difficulty;
  }

  return (
    <article className="quest-card">
      <Link to={`/quest/${quest.id}`}>
        <div className="quest-card__img">
          <picture>
            <source
              type="image/webp"
              srcSet={`${quest.imageWebp} 1x, ${quest.imageWebp2x ?? quest.imageWebp} 2x`}
            />
            <img
              src={quest.imageJpg}
              srcSet={`${quest.imageJpg2x} 2x`}
              width={QUEST_CARD_IMAGE_SIZE.width}
              height={QUEST_CARD_IMAGE_SIZE.height}
              alt={quest.alt}
            />
          </picture>
        </div>
        <div className="quest-card__content">
          <div className="quest-card__info-wrapper">
            <span className="quest-card__link">{quest.title}</span>
          </div>
          <ul className="tags quest-card__tags">
            <li className="tags__item">
              <svg width="11" height="14" aria-hidden="true">
                <use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#icon-person`} />
              </svg>
              {quest.minPeople}-{quest.maxPeople} чел
            </li>
            <li className="tags__item">
              <svg width="14" height="14" aria-hidden="true">
                <use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#icon-level`} />
              </svg>
              {difficultyLabel}
            </li>
          </ul>
        </div>
      </Link>
    </article>
  );
};

const MemoQuestCard = memo(QuestCard);
export default MemoQuestCard;

export type {Quest};

