import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import type {Quest} from '../components/quest-card';
import {getQuests} from '../services/quests-api';

type ThemeFilter = 'all' | 'adventure' | 'horror' | 'mystic' | 'detective' | 'sci-fi';
type DifficultyFilter = 'any' | 'easy' | 'medium' | 'hard';

type QuestsState = {
  quests: Quest[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  theme: ThemeFilter;
  difficulty: DifficultyFilter;
};

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

const initialState: QuestsState = {
  quests: [],
  status: 'idle',
  error: null,
  theme: 'all',
  difficulty: 'any',
};

const fetchQuestsAction = createAsyncThunk<Quest[]>(
  'quests/fetch',
  async () => {
    const data = await getQuests();
    return data.map((quest) => {
      const {min, max} = mapPeopleMinMax(quest.peopleMinMax);
      return {
        id: quest.id,
        title: quest.title,
        theme: mapServerQuestTypeToTheme(quest.type),
        difficulty: quest.level,
        minPeople: min,
        maxPeople: max,
        description: '',
        imageWebp: quest.previewImgWebp,
        imageWebp2x: quest.previewImgWebp,
        imageJpg: quest.previewImg,
        imageJpg2x: quest.previewImg,
        backgroundImageJpg: quest.previewImg,
        alt: quest.title,
      };
    });
  }
);

const questsSlice = createSlice({
  name: 'quests',
  initialState,
  reducers: {
    setTheme: (state, action: {payload: ThemeFilter}) => {
      state.theme = action.payload;
    },
    setDifficulty: (state, action: {payload: DifficultyFilter}) => {
      state.difficulty = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestsAction.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchQuestsAction.fulfilled, (state, action) => {
        state.status = 'success';
        state.quests = action.payload;
      })
      .addCase(fetchQuestsAction.rejected, (state, action) => {
        state.status = 'error';
        state.quests = [];
        state.error = action.error.message ?? 'Не удалось загрузить квесты.';
      });
  },
});

const {setTheme, setDifficulty} = questsSlice.actions;
export default questsSlice.reducer;

export {fetchQuestsAction, setDifficulty, setTheme};
export type {DifficultyFilter, ThemeFilter};

