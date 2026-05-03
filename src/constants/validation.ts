const PHONE_REGEX = /^\+7\s?\(\d{3}\)\s?\d{3}-\d{2}-\d{2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_NAME_REGEX = /^[A-Za-zА-Яа-яЁё' -]{1,15}$/;
const BOOKING_FORM_PHONE_DISPLAY_REGEX = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/;

const PASSWORD_LENGTH = {
  min: 3,
  max: 15,
} as const;

export {
  BOOKING_FORM_PHONE_DISPLAY_REGEX,
  CONTACT_NAME_REGEX,
  EMAIL_REGEX,
  PASSWORD_LENGTH,
  PHONE_REGEX,
};
