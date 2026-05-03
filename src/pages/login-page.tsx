import {useState, type FormEvent} from 'react';
import {Navigate, useLocation, useNavigate} from 'react-router-dom';
import ErrorBox from '../components/error-box';
import {HERO_IMAGE_SIZE} from '../constants/ui';
import {EMAIL_REGEX, PASSWORD_LENGTH} from '../constants/validation';

type LoginPageProps = {
  onLogin: (email: string, password: string) => Promise<void>;
  isAuthorized: boolean;
};

const isValidPassword = (value: string) => {
  if (value.length < PASSWORD_LENGTH.min || value.length > PASSWORD_LENGTH.max) {
    return false;
  }

  const hasLetter = /\p{L}/u.test(value);
  const hasDigit = /\d/.test(value);

  return hasLetter && hasDigit;
};

const LoginPage = ({onLogin, isAuthorized}: LoginPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as {from?: {pathname: string}} | null)?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const handleLogin = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const nextErrors: string[] = [];
    const agreed = (evt.currentTarget.elements.namedItem('user-agreement') as HTMLInputElement | null)?.checked;

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      nextErrors.push('Логин (email) не может быть пустым.');
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      nextErrors.push('Введите корректный email.');
    }

    if (!trimmedPassword) {
      nextErrors.push('Пароль не может быть пустым.');
    } else if (!isValidPassword(trimmedPassword)) {
      nextErrors.push('Пароль должен быть от 3 до 15 символов и содержать минимум одну букву и одну цифру.');
    }

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (!agreed) {
      setErrors([
        'Необходимо согласие с правилами обработки персональных данных и пользовательским соглашением.',
      ]);
      return;
    }

    setErrors([]);
    try {
      await onLogin(trimmedEmail, trimmedPassword);
      navigate(from, {replace: true});
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Не удалось выполнить вход.']);
    }
  };

  if (isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="decorated-page login">
      <div className="decorated-page__decor" aria-hidden="true">
        <picture>
          <source
            type="image/webp"
            srcSet={`${import.meta.env.BASE_URL}img/content/maniac/maniac-size-m.webp, ${import.meta.env.BASE_URL}img/content/maniac/maniac-size-m@2x.webp 2x`}
          />
          <img
            src={`${import.meta.env.BASE_URL}img/content/maniac/maniac-size-m.jpg`}
            srcSet={`${import.meta.env.BASE_URL}img/content/maniac/maniac-size-m@2x.jpg 2x`}
            width={HERO_IMAGE_SIZE.width}
            height={HERO_IMAGE_SIZE.height}
            alt=""
          />
        </picture>
      </div>
      <div className="container container--size-l">
        <div className="login__form">
          <form
            className="login-form"
            action="#"
            method="post"
            onSubmit={(evt) => {
              void handleLogin(evt);
            }}
          >
            <div className="login-form__inner-wrapper">
              <h1 className="title title--size-s login-form__title">Вход</h1>

              <ErrorBox errors={errors} />

              <div className="login-form__inputs">
                <div className="custom-input login-form__input">
                  <label className="custom-input__label" htmlFor="email">E&nbsp;&ndash;&nbsp;mail</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Адрес электронной почты"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>

                <div className="custom-input login-form__input">
                  <label className="custom-input__label" htmlFor="password">Пароль</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button className="btn btn--accent btn--general login-form__submit" type="submit">Войти</button>
            </div>
            <label className="custom-checkbox login-form__checkbox">
              <input type="checkbox" id="login-user-agreement" name="user-agreement" />
              <span className="custom-checkbox__icon">
                <svg width="20" height="17" aria-hidden="true">
                  <use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#icon-tick`} />
                </svg>
              </span>
              <span className="custom-checkbox__label">
                Я{'\u00A0'}согласен с{' '}
                <a
                  className="link link--active-silver link--underlined"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  правилами обработки персональных данных
                </a>
                {'\u00A0'}и{' '}
                <a
                  className="link link--active-silver link--underlined"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  пользовательским соглашением
                </a>
              </span>
            </label>
          </form>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
