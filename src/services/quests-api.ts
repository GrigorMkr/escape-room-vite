import {requestJson} from './api-client';

type QuestLevel = 'easy' | 'medium' | 'hard';
type QuestType = 'adventures' | 'horror' | 'mystic' | 'detective' | 'sci-fi';

type QuestListItemResponse = {
  id: string;
  title: string;
  previewImg: string;
  previewImgWebp: string;
  level: QuestLevel;
  type: QuestType;
  peopleMinMax: number[];
};

type QuestDetailResponse = QuestListItemResponse & {
  description: string;
  coverImg: string;
  coverImgWebp: string;
};

const getQuests = async (): Promise<QuestListItemResponse[]> => {
  const quests = await requestJson<QuestListItemResponse[]>('/quest');
  return quests;
};

const getQuest = async (questId: string): Promise<QuestDetailResponse> => {
  const quest = await requestJson<QuestDetailResponse>(`/quest/${questId}`);
  return quest;
};

export {getQuest, getQuests};
export type {QuestDetailResponse, QuestLevel, QuestListItemResponse, QuestType};

