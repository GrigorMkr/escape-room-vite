import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import type {Quest} from '../components/quest-card';
import {getQuests} from '../services/quests-api';
import {
  academyCatalogPreview,
  getCatalogCardPictureSources,
  getGradingQuestSlugFromUrl,
} from '../utils/academy-catalog-preview';

const previewAssetOpts = {assetBaseUrl: import.meta.env.BASE_URL};
const previewBaseUrl = import.meta.env.BASE_URL;

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
      const catalogSlug = getGradingQuestSlugFromUrl(quest.previewImg);
      const markupCard = catalogSlug ? getCatalogCardPictureSources(catalogSlug, previewBaseUrl) : null;

      let previewWebp = academyCatalogPreview(quest.previewImgWebp, previewAssetOpts);
      let previewWebp2x = academyCatalogPreview(quest.previewImgWebp, {...previewAssetOpts, retina: true});
      let previewJpg = academyCatalogPreview(quest.previewImg, previewAssetOpts);
      let previewJpg2x = academyCatalogPreview(quest.previewImg, {...previewAssetOpts, retina: true});

      if (markupCard) {
        previewWebp = markupCard.webp;
        previewWebp2x = markupCard.webp2x;
        previewJpg = markupCard.jpg;
        previewJpg2x = markupCard.jpg2x;
      }
      return {
        id: quest.id,
        title: quest.title,
        theme: mapServerQuestTypeToTheme(quest.type),
        difficulty: quest.level,
        minPeople: min,
        maxPeople: max,
        description: '',
        imageWebp: previewWebp,
        imageWebp2x: previewWebp2x,
        imageJpg: previewJpg,
        imageJpg2x: previewJpg2x,
        backgroundImageJpg: previewJpg,
        alt: quest.title,
        catalogCardImageCentered: catalogSlug === 'maniac',
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

