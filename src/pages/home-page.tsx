import {useCallback, useEffect} from 'react';
import QuestList from '../components/quest-list';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {fetchQuestsAction, setDifficulty, setTheme} from '../store/quests-slice';
import {selectFilteredQuests, selectQuestDifficulty, selectQuestError, selectQuestStatus, selectQuestTheme} from '../store/quests-selectors';

const THEME_FILTERS = [
  {id: 'all', value: 'all', label: 'Все квесты', icon: 'icon-all-quests', iconSize: {width: 26, height: 30}},
  {id: 'adventure', value: 'adventure', label: 'Приключения', icon: 'icon-adventure', iconSize: {width: 36, height: 30}},
  {id: 'horror', value: 'horror', label: 'Ужасы', icon: 'icon-horror', iconSize: {width: 30, height: 30}},
  {id: 'mystic', value: 'mystic', label: 'Мистика', icon: 'icon-mystic', iconSize: {width: 30, height: 30}},
  {id: 'detective', value: 'detective', label: 'Детектив', icon: 'icon-detective', iconSize: {width: 40, height: 30}},
  {id: 'sciFi', value: 'sci-fi', label: 'Sci-fi', icon: 'icon-sci-fi', iconSize: {width: 28, height: 30}},
] as const;

const DIFFICULTY_FILTERS = [
  {id: 'any', value: 'any', label: 'Любой'},
  {id: 'easy', value: 'easy', label: 'Простой'},
  {id: 'middle', value: 'medium', label: 'Средний'},
  {id: 'hard', value: 'hard', label: 'Сложный'},
] as const;

const HomePage = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectQuestTheme);
  const difficulty = useAppSelector(selectQuestDifficulty);
  const quests = useAppSelector(selectFilteredQuests);
  const status = useAppSelector(selectQuestStatus);
  const serverError = useAppSelector(selectQuestError);

  useEffect(() => {
    void dispatch(fetchQuestsAction());
  }, [dispatch]);

  const handleThemeChange = useCallback((value: Parameters<typeof setTheme>[0]) => {
    dispatch(setTheme(value));
  }, [dispatch]);

  const handleDifficultyChange = useCallback((value: Parameters<typeof setDifficulty>[0]) => {
    dispatch(setDifficulty(value));
  }, [dispatch]);

  let questsContent;
  if (status === 'loading') {
    questsContent = <p>Загрузка квестов...</p>;
  } else if (serverError) {
    questsContent = <p>{serverError}</p>;
  } else if (quests.length > 0) {
    questsContent = <QuestList quests={quests} />;
  } else {
    questsContent = <p>По выбранным фильтрам квестов не найдено.</p>;
  }

  return (
    <main className="page-content">
      <div className="container">
        <div className="page-content__title-wrapper">
          <h1 className="subtitle page-content__subtitle">квесты в Санкт-Петербурге</h1>
          <h2 className="title title--size-m page-content__title">Выберите тематику</h2>
        </div>
        <div className="page-content__item">
          <form className="filter" action="#" method="get">
            <fieldset className="filter__section">
              <legend className="visually-hidden">Тематика</legend>
              <ul className="filter__list">
                {THEME_FILTERS.map((item) => (
                  <li key={item.id} className="filter__item">
                    <input
                      type="radio"
                      name="type"
                      id={item.id}
                      checked={theme === item.value}
                      onChange={() => handleThemeChange(item.value)}
                    />
                    <label className="filter__label" htmlFor={item.id}>
                      <svg
                        className="filter__icon"
                        width={item.iconSize.width}
                        height={item.iconSize.height}
                        aria-hidden="true"
                      >
                        <use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#${item.icon}`} />
                      </svg>
                      <span className="filter__label-text">{item.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
            <fieldset className="filter__section">
              <legend className="visually-hidden">Сложность</legend>
              <ul className="filter__list">
                {DIFFICULTY_FILTERS.map((item) => (
                  <li key={item.id} className="filter__item">
                    <input
                      type="radio"
                      name="level"
                      id={item.id}
                      checked={difficulty === item.value}
                      onChange={() => handleDifficultyChange(item.value)}
                    />
                    <label className="filter__label" htmlFor={item.id}>
                      <span className="filter__label-text">{item.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          </form>
        </div>
        <h2 className="title visually-hidden">Выберите квест</h2>
        {questsContent}
      </div>
    </main>
  );
};

export default HomePage;
