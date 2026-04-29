const MAP_DEFAULT_CENTER: [number, number] = [59.96831, 30.31748];
const MAP_DEFAULT_ZOOM = 16;

const PIN_ICON_SIZE: [number, number] = [28, 40];
const PIN_ICON_ANCHOR: [number, number] = [14, 40];

const QUEST_CARD_IMAGE_SIZE = {
  width: 344,
  height: 232,
} as const;

const HERO_IMAGE_SIZE = {
  width: 1366,
  height: 768,
} as const;

const LOGO_SIZE = {
  width: 134,
  height: 52,
} as const;

const SOCIAL_ICON_SIZE = 28;

export {
  HERO_IMAGE_SIZE,
  LOGO_SIZE,
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  PIN_ICON_ANCHOR,
  PIN_ICON_SIZE,
  QUEST_CARD_IMAGE_SIZE,
  SOCIAL_ICON_SIZE,
};
