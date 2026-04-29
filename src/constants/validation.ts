const PHONE_REGEX = /^\+7\s?\(\d{3}\)\s?\d{3}-\d{2}-\d{2}$/;
const NAME_REGEX = /^[A-Za-zА-Яа-яЁё' -]{1,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_LENGTH = {
  min: 3,
  max: 15,
} as const;

export {EMAIL_REGEX, NAME_REGEX, PASSWORD_LENGTH, PHONE_REGEX};
