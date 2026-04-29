import {useCallback, useEffect} from 'react';
import QuestList from '../components/quest-list';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {fetchQuestsAction, setDifficulty, setTheme} from '../store/quests-slice';
import {selectFilteredQuests, selectQuestDifficulty, selectQuestError, selectQuestStatus, selectQuestTheme} from '../store/quests-selectors';

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
                <li className="filter__item"><input type="radio" name="type" id="all" checked={theme === 'all'} onChange={() => handleThemeChange('all')} /><label className="filter__label" htmlFor="all"><svg className="filter__icon" width="26" height="30" aria-hidden="true"><use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#icon-all-quests`} /></svg><span className="filter__label-text">Все квесты</span></label></li>
                <li className="filter__item"><input type="radio" name="type" id="adventure" checked={theme === 'adventure'} onChange={() => handleThemeChange('adventure')} /><label className="filter__label" htmlFor="adventure"><svg className="filter__icon" width="36" height="30" aria-hidden="true"><use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#icon-adventure`} /></svg><span className="filter__label-text">Приключения</span></label></li>
                <li className="filter__item"><input type="radio" name="type" id="horror" checked={theme === 'horror'} onChange={() => handleThemeChange('horror')} /><label className="filter__label" htmlFor="horror"><svg className="filter__icon" width="30" height="30" aria-hidden="true"><use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#icon-horror`} /></svg><span className="filter__label-text">Ужасы</span></label></li>
                <li className="filter__item"><input type="radio" name="type" id="mystic" checked={theme === 'mystic'} onChange={() => handleThemeChange('mystic')} /><label className="filter__label" htmlFor="mystic"><svg className="filter__icon" width="30" height="30" aria-hidden="true"><use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#icon-mystic`} /></svg><span className="filter__label-text">Мистика</span></label></li>
                <li className="filter__item"><input type="radio" name="type" id="detective" checked={theme === 'detective'} onChange={() => handleThemeChange('detective')} /><label className="filter__label" htmlFor="detective"><svg className="filter__icon" width="40" height="30" aria-hidden="true"><use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#icon-detective`} /></svg><span className="filter__label-text">Детектив</span></label></li>
                <li className="filter__item"><input type="radio" name="type" id="sciFi" checked={theme === 'sci-fi'} onChange={() => handleThemeChange('sci-fi')} /><label className="filter__label" htmlFor="sciFi"><svg className="filter__icon" width="28" height="30" aria-hidden="true"><use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#icon-sci-fi`} /></svg><span className="filter__label-text">Sci-fi</span></label></li>
              </ul>
            </fieldset>
            <fieldset className="filter__section">
              <legend className="visually-hidden">Сложность</legend>
              <ul className="filter__list">
                <li className="filter__item"><input type="radio" name="level" id="any" checked={difficulty === 'any'} onChange={() => handleDifficultyChange('any')} /><label className="filter__label" htmlFor="any"><span className="filter__label-text">Любой</span></label></li>
                <li className="filter__item"><input type="radio" name="level" id="easy" checked={difficulty === 'easy'} onChange={() => handleDifficultyChange('easy')} /><label className="filter__label" htmlFor="easy"><span className="filter__label-text">Простой</span></label></li>
                <li className="filter__item"><input type="radio" name="level" id="middle" checked={difficulty === 'medium'} onChange={() => handleDifficultyChange('medium')} /><label className="filter__label" htmlFor="middle"><span className="filter__label-text">Средний</span></label></li>
                <li className="filter__item"><input type="radio" name="level" id="hard" checked={difficulty === 'hard'} onChange={() => handleDifficultyChange('hard')} /><label className="filter__label" htmlFor="hard"><span className="filter__label-text">Сложный</span></label></li>
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
