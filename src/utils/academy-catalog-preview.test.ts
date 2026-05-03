import {describe, expect, it} from 'vitest';
import {
  academyCatalogPreview,
  academyQuestDecorCover,
  getCatalogCardPictureSources,
  getGradingQuestSlugFromUrl,
  getQuestDecorHeroPictureSources,
} from './academy-catalog-preview';

const CRYPT_IMAGES = {
  previewImg: 'https://grading.design.htmlacademy.pro/static/quest/crypt.jpg',
  previewImgWebp: 'https://grading.design.htmlacademy.pro/static/quest/crypt.webp',
  coverImg: 'https://grading.design.htmlacademy.pro/static/quest/crypt@2x.jpg',
  coverImgWebp: 'https://grading.design.htmlacademy.pro/static/quest/crypt@2x.webp',
};

const QUEST_WITHOUT_LOCAL_HERO = {
  previewImg: 'https://grading.design.htmlacademy.pro/static/quest/neo-tokyo.jpg',
  previewImgWebp: 'https://grading.design.htmlacademy.pro/static/quest/neo-tokyo.webp',
  coverImg: 'https://grading.design.htmlacademy.pro/static/quest/neo-tokyo@2x.jpg',
  coverImgWebp: 'https://grading.design.htmlacademy.pro/static/quest/neo-tokyo@2x.webp',
};

const MANIAC_QUEST_IMAGES = {
  previewImg: 'https://grading.design.htmlacademy.pro/static/quest/maniac.jpg',
  previewImgWebp: 'https://grading.design.htmlacademy.pro/static/quest/maniac.webp',
  coverImg: 'https://grading.design.htmlacademy.pro/static/quest/maniac@2x.jpg',
  coverImgWebp: 'https://grading.design.htmlacademy.pro/static/quest/maniac@2x.webp',
};

describe('academyCatalogPreview', () => {
  const maniacJpgApi = 'https://grading.design.htmlacademy.pro/static/quest/maniac.jpg';

  it('maps -size-s to -size-m before extension or @2x suffix', () => {
    expect(academyCatalogPreview('/img/content/maniac/maniac-size-s.jpg')).toBe(
      '/img/content/maniac/maniac-size-m.jpg',
    );
    expect(academyCatalogPreview('/crypt-size-s@2x.webp')).toBe('/crypt-size-m@2x.webp');
    expect(academyCatalogPreview('/q/photo_size_s@2x.jpg')).toBe('/q/photo_size_m@2x.jpg');
  });

  it('rewrites grading maniac preview to CDN -size-m when assetBaseUrl omitted', () => {
    expect(academyCatalogPreview(maniacJpgApi)).toBe(
      'https://grading.design.htmlacademy.pro/static/quest/maniac-size-m.jpg',
    );
    expect(academyCatalogPreview(`${maniacJpgApi.replace(/jpg$/, 'webp')}`)).toBe(
      'https://grading.design.htmlacademy.pro/static/quest/maniac-size-m.webp',
    );
  });

  it('uses CDN size-m for maniac; leaves other decor slugs on API preview (344×232 framing)', () => {
    expect(academyCatalogPreview(maniacJpgApi, {assetBaseUrl: '/'})).toBe(
      'https://grading.design.htmlacademy.pro/static/quest/maniac-size-m.jpg',
    );
    expect(academyCatalogPreview(maniacJpgApi, {assetBaseUrl: '/', retina: true})).toBe(
      'https://grading.design.htmlacademy.pro/static/quest/maniac-size-m@2x.jpg',
    );
    const cryptJpg = 'https://grading.design.htmlacademy.pro/static/quest/crypt.jpg';
    expect(academyCatalogPreview(cryptJpg, {assetBaseUrl: '/'})).toBe(cryptJpg);
    expect(academyCatalogPreview(cryptJpg, {assetBaseUrl: '/', retina: true})).toBe(cryptJpg);
  });

  it('adds @2x to grading maniac CDN preview when retina is requested', () => {
    expect(academyCatalogPreview(maniacJpgApi, {retina: true})).toBe(
      'https://grading.design.htmlacademy.pro/static/quest/maniac-size-m@2x.jpg',
    );
  });

  it('leaves grading crypt preview unchanged (avoid @2x aspect mismatch in cards)', () => {
    const cryptJpg = 'https://grading.design.htmlacademy.pro/static/quest/crypt.jpg';
    expect(academyCatalogPreview(cryptJpg)).toBe(cryptJpg);
  });

  it('leaves unrelated URLs untouched', () => {
    expect(academyCatalogPreview('/img/q.jpg')).toBe('/img/q.jpg');
  });
});

describe('getCatalogCardPictureSources', () => {
  it('returns markup-relative paths under public for known slugs', () => {
    expect(getCatalogCardPictureSources('crypt', './')).toEqual({
      webp: './img/content/crypt/crypt-size-m.webp',
      webp2x: './img/content/crypt/crypt-size-m@2x.webp',
      jpg: './img/content/crypt/crypt-size-m.jpg',
      jpg2x: './img/content/crypt/crypt-size-m@2x.jpg',
    });
  });

  it('normalizes asset base trailing slash', () => {
    expect(getCatalogCardPictureSources('mars', '.')).toEqual({
      webp: './img/content/mars/mars-size-m.webp',
      webp2x: './img/content/mars/mars-size-m@2x.webp',
      jpg: './img/content/mars/mars-size-m.jpg',
      jpg2x: './img/content/mars/mars-size-m@2x.jpg',
    });
  });

  it('returns null for unknown slug', () => {
    expect(getCatalogCardPictureSources('neo-tokyo', './')).toBeNull();
    expect(getCatalogCardPictureSources(null, './')).toBeNull();
  });
});

describe('getGradingQuestSlugFromUrl', () => {
  it('parses grading static quest asset URLs', () => {
    expect(
      getGradingQuestSlugFromUrl(
        'https://grading.design.htmlacademy.pro/static/quest/maniac.jpg',
      ),
    ).toBe('maniac');
    expect(
      getGradingQuestSlugFromUrl(
        'https://grading.design.htmlacademy.pro/static/quest/maniac@2x.webp',
      ),
    ).toBe('maniac');
  });

  it('returns null for non-grading paths', () => {
    expect(getGradingQuestSlugFromUrl('/img/local.jpg')).toBeNull();
  });
});

describe('getQuestDecorHeroPictureSources', () => {
  it('uses grading CDN maniac-size-m for maniac hero', () => {
    expect(getQuestDecorHeroPictureSources(MANIAC_QUEST_IMAGES)).toEqual({
      webp: 'https://grading.design.htmlacademy.pro/static/quest/maniac-size-m.webp',
      webp2x: 'https://grading.design.htmlacademy.pro/static/quest/maniac-size-m@2x.webp',
      jpg: 'https://grading.design.htmlacademy.pro/static/quest/maniac-size-m.jpg',
      jpg2x: 'https://grading.design.htmlacademy.pro/static/quest/maniac-size-m@2x.jpg',
    });
  });

  it('uses API @2x covers for crypt (no crypt-size-m on CDN)', () => {
    expect(getQuestDecorHeroPictureSources(CRYPT_IMAGES)).toEqual({
      webp: CRYPT_IMAGES.coverImgWebp,
      webp2x: CRYPT_IMAGES.coverImgWebp,
      jpg: CRYPT_IMAGES.coverImg,
      jpg2x: CRYPT_IMAGES.coverImg,
    });
  });

  it('falls back to API covers when slug has no local hero size-m pack', () => {
    expect(getQuestDecorHeroPictureSources(QUEST_WITHOUT_LOCAL_HERO)).toEqual({
      webp: QUEST_WITHOUT_LOCAL_HERO.coverImgWebp,
      webp2x: QUEST_WITHOUT_LOCAL_HERO.coverImgWebp,
      jpg: QUEST_WITHOUT_LOCAL_HERO.coverImg,
      jpg2x: QUEST_WITHOUT_LOCAL_HERO.coverImg,
    });
  });
});

describe('academyQuestDecorCover', () => {
  const maniacCover = 'https://grading.design.htmlacademy.pro/static/quest/maniac@2x.jpg';

  it('maps maniac cover to bg-size-m on CDN when no base', () => {
    expect(academyQuestDecorCover(maniacCover)).toBe(
      'https://grading.design.htmlacademy.pro/static/quest/maniac-bg-size-m@2x.jpg',
    );
  });

  it('leaves covers for other quests as returned by API', () => {
    const crypt =
      'https://grading.design.htmlacademy.pro/static/quest/palace@2x.webp';
    expect(academyQuestDecorCover(crypt)).toBe(crypt);
  });
});
