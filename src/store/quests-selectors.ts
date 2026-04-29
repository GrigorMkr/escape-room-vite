import {createSelector} from '@reduxjs/toolkit';
import type {RootState} from './store';

const selectQuestTheme = (state: RootState) => state.quests.theme;
const selectQuestDifficulty = (state: RootState) => state.quests.difficulty;
const selectAllQuests = (state: RootState) => state.quests.quests;
const selectQuestStatus = (state: RootState) => state.quests.status;
const selectQuestError = (state: RootState) => state.quests.error;

const selectFilteredQuests = createSelector(
  [selectAllQuests, selectQuestTheme, selectQuestDifficulty],
  (quests, theme, difficulty) => quests.filter((q) => (
    (theme === 'all' || q.theme === theme) && (difficulty === 'any' || q.difficulty === difficulty)
  ))
);

export {
  selectAllQuests,
  selectFilteredQuests,
  selectQuestDifficulty,
  selectQuestError,
  selectQuestStatus,
  selectQuestTheme,
};

