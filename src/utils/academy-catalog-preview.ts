const GRADING_STATIC_QUEST_BASE = 'https://grading.design.htmlacademy.pro/static/quest';

const GRADING_STATIC_QUEST_PREVIEW =
  /^https:\/\/grading\.design\.htmlacademy\.pro\/static\/quest\/([\w-]+)\.(jpg|jpeg|webp)$/i;

const GRADING_STATIC_QUEST_COVER =
  /^https:\/\/grading\.design\.htmlacademy\.pro\/static\/quest\/([\w-]+)@2x\.(jpg|jpeg|webp)$/i;

const GRADING_STATIC_QUEST_ANY =
  /^https:\/\/grading\.design\.htmlacademy\.pro\/static\/quest\/([\w-]+)(?:@\d+x)?\.(jpg|jpeg|webp)$/i;

const GRADING_COVER_BG_SIZE_M_SLUGS = new Set<string>(['maniac']);

const QUEST_DECOR_HERO_SIZE_M_SLUGS = new Set<string>([
  'crypt',
  'experiment',
  'frontier',
  'ghosts',
  'hut',
  'loft',
  'maniac',
  'mars',
  'metro',
  'palace',
  'ritual',
]);

export type CatalogCardPictureSources = {
  webp: string;
  webp2x: string;
  jpg: string;
  jpg2x: string;
};

const normalizeAssetBase = (assetBaseUrl: string): string =>
  assetBaseUrl.endsWith('/') ? assetBaseUrl : `${assetBaseUrl}/`;

const getCatalogCardPictureSources = (
  slug: string | null,
  assetBaseUrl: string,
): CatalogCardPictureSources | null => {
  if (!slug || !QUEST_DECOR_HERO_SIZE_M_SLUGS.has(slug)) {
    return null;
  }
  const base = normalizeAssetBase(assetBaseUrl);
  const root = `${base}img/content/${slug}/${slug}-size-m`;
  return {
    webp: `${root}.webp`,
    webp2x: `${root}@2x.webp`,
    jpg: `${root}.jpg`,
    jpg2x: `${root}@2x.jpg`,
  };
};

type AcademyCatalogPreviewOptions = {
  retina?: boolean;
  assetBaseUrl?: string;
};

const academyCatalogPreview = (url: string, options?: AcademyCatalogPreviewOptions): string => {
  const {retina = false} = options ?? {};
  const previewMatch = url.match(GRADING_STATIC_QUEST_PREVIEW);
  if (previewMatch) {
    const slug = previewMatch[1].toLowerCase();
    const ext = previewMatch[2].toLowerCase();
    const suffix = retina ? '@2x' : '';
    if (QUEST_DECOR_HERO_SIZE_M_SLUGS.has(slug)) {
      if (slug === 'maniac') {
        return `${GRADING_STATIC_QUEST_BASE}/maniac-size-m${suffix}.${ext}`;
      }
      return url;
    }
  }

  return url
    .replace(/-size-s(?=[.@])/g, '-size-m')
    .replace(/_size_s(?=[.@])/gi, '_size_m');
};

const academyQuestDecorCover = (url: string): string => {
  const m = url.match(GRADING_STATIC_QUEST_COVER);
  if (m && GRADING_COVER_BG_SIZE_M_SLUGS.has(m[1].toLowerCase())) {
    const slug = m[1].toLowerCase();
    const ext = m[2].toLowerCase();
    return `${GRADING_STATIC_QUEST_BASE}/${slug}-bg-size-m@2x.${ext}`;
  }
  return url;
};

const getGradingQuestSlugFromUrl = (url: string): string | null => {
  const m = url.match(GRADING_STATIC_QUEST_ANY);
  return m ? m[1].toLowerCase() : null;
};

type QuestApiImages = {
  previewImg: string;
  previewImgWebp: string;
  coverImg: string;
  coverImgWebp: string;
};

type QuestDecorHeroPictureSources = {
  webp: string;
  webp2x: string;
  jpg: string;
  jpg2x: string;
};

const getQuestDecorHeroPictureSources = (data: QuestApiImages): QuestDecorHeroPictureSources => {
  const slug =
    getGradingQuestSlugFromUrl(data.previewImg) ?? getGradingQuestSlugFromUrl(data.coverImg);
  if (slug === 'maniac' && QUEST_DECOR_HERO_SIZE_M_SLUGS.has(slug)) {
    const root = `${GRADING_STATIC_QUEST_BASE}/maniac-size-m`;
    return {
      webp: `${root}.webp`,
      webp2x: `${root}@2x.webp`,
      jpg: `${root}.jpg`,
      jpg2x: `${root}@2x.jpg`,
    };
  }
  return {
    webp: data.coverImgWebp,
    webp2x: data.coverImgWebp,
    jpg: data.coverImg,
    jpg2x: data.coverImg,
  };
};

export type {AcademyCatalogPreviewOptions, QuestDecorHeroPictureSources};
export {
  academyCatalogPreview,
  academyQuestDecorCover,
  getCatalogCardPictureSources,
  getGradingQuestSlugFromUrl,
  getQuestDecorHeroPictureSources,
};
