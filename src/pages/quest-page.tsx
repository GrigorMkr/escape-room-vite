import {useEffect, useState} from 'react';
import {Link, Navigate, useParams} from 'react-router-dom';
import type {Quest} from '../components/quest-card';
import {HERO_IMAGE_SIZE} from '../constants/ui';
import {ApiError} from '../services/api-client';
import {
  academyCatalogPreview,
  getGradingQuestSlugFromUrl,
  getQuestDecorHeroPictureSources,
  type QuestDecorHeroPictureSources,
} from '../utils/academy-catalog-preview';
import {getQuest} from '../services/quests-api';

const previewAssetOpts = {assetBaseUrl: import.meta.env.BASE_URL};

const mapServerQuestTypeToTheme = (type: string): Quest['theme'] => {
  switch (type) {
    case 'adventures':
      return 'adventure';
    default:
      return type as Quest['theme'];
  }
};

const mapPeopleMinMax = (value: number[]): {min: number; max: number} => {
  if (value.length >= 2) {
    return {min: value[0], max: value[1]};
  }
  if (value.length === 1) {
    return {min: value[0], max: value[0]};
  }
  return {min: 2, max: 5};
};

const QuestPage = () => {
  const {id} = useParams();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [heroDecor, setHeroDecor] = useState<QuestDecorHeroPictureSources | null>(null);
  const [heroDecorImageCentered, setHeroDecorImageCentered] = useState(false);
  const [serverError, setServerError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      return;
    }
    setServerError('');
    setNotFound(false);
    setQuest(null);
    setHeroDecor(null);
    setHeroDecorImageCentered(false);

    let cancelled = false;
    void (async () => {
      try {
        const data = await getQuest(id);
        if (cancelled) {
          return;
        }
        const {min, max} = mapPeopleMinMax(data.peopleMinMax);
        const previewWebp = academyCatalogPreview(data.previewImgWebp, previewAssetOpts);
        const previewWebp2x = academyCatalogPreview(data.previewImgWebp, {...previewAssetOpts, retina: true});
        const previewJpg = academyCatalogPreview(data.previewImg, previewAssetOpts);
        const previewJpg2x = academyCatalogPreview(data.previewImg, {...previewAssetOpts, retina: true});
        setHeroDecor(getQuestDecorHeroPictureSources(data));
        const decorSlug =
          getGradingQuestSlugFromUrl(data.previewImg) ?? getGradingQuestSlugFromUrl(data.coverImg);
        setHeroDecorImageCentered(decorSlug === 'maniac');
        setQuest({
          id: data.id,
          title: data.title,
          theme: mapServerQuestTypeToTheme(data.type),
          difficulty: data.level,
          minPeople: min,
          maxPeople: max,
          description: data.description,
          imageWebp: previewWebp,
          imageWebp2x: previewWebp2x,
          imageJpg: previewJpg,
          imageJpg2x: previewJpg2x,
          backgroundImageJpg: previewJpg,
          alt: data.title,
        });
      } catch (err) {
        if (cancelled) {
          return;
        }
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
          return;
        }
        setServerError(err instanceof Error ? err.message : 'Не удалось загрузить квест.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (notFound) {
    return <Navigate to="/404" replace />;
  }

  if (!quest) {
    return (
      <main className="page-content">
        <div className="container">
          {serverError ? <p>{serverError}</p> : <h1 className="title title--size-m">Загрузка...</h1>}
        </div>
      </main>
    );
  }

  let themeLabel = '';
  switch (quest.theme) {
    case 'adventure':
      themeLabel = 'Приключения';
      break;
    case 'horror':
      themeLabel = 'Ужасы';
      break;
    case 'mystic':
      themeLabel = 'Мистика';
      break;
    case 'detective':
      themeLabel = 'Детектив';
      break;
    case 'sci-fi':
      themeLabel = 'Sci-fi';
      break;
    default:
      themeLabel = quest.theme;
  }

  let difficultyLabel = '';
  switch (quest.difficulty) {
    case 'easy':
      difficultyLabel = 'Лёгкий';
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

  const questPageMainClass = heroDecorImageCentered
    ? 'decorated-page quest-page quest-page--hero-image-center'
    : 'decorated-page quest-page';

  return (
    <main className={questPageMainClass}>
      <div className="decorated-page__decor" aria-hidden="true">
        {heroDecor ? (
          <picture>
            <source type="image/webp" srcSet={`${heroDecor.webp} 1x, ${heroDecor.webp2x} 2x`} />
            <img
              src={heroDecor.jpg}
              srcSet={`${heroDecor.jpg2x} 2x`}
              width={HERO_IMAGE_SIZE.width}
              height={HERO_IMAGE_SIZE.height}
              alt=""
            />
          </picture>
        ) : null}
      </div>
      <div className="container container--size-l">
        <div className="quest-page__content">
          <h1 className="title title--size-l title--uppercase quest-page__title">{quest.title}</h1>
          <p className="subtitle quest-page__subtitle">{themeLabel}</p>
          <ul className="tags tags--size-l quest-page__tags">
            <li className="tags__item">
              <svg width="11" height="14" aria-hidden="true">
                <use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#icon-person`} />
              </svg>
              {quest.minPeople}
              {'\u2013'}
              {quest.maxPeople}
              {'\u00A0'}
              чел
            </li>
            <li className="tags__item">
              <svg width="14" height="14" aria-hidden="true">
                <use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#icon-level`} />
              </svg>
              {difficultyLabel}
            </li>
          </ul>
          <p className="quest-page__description">{quest.description}</p>
          <Link className="btn btn--accent btn--cta quest-page__btn" to={`/quest/${quest.id}/booking`}>Забронировать</Link>
        </div>
      </div>
    </main>
  );
};

export default QuestPage;
