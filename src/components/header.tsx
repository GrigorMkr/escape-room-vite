import {NavLink, Link} from 'react-router-dom';
import {LOGO_SIZE} from '../constants/ui';

type HeaderProps = {
  isAuthorized: boolean;
  onLogout: () => void;
};

const Header = ({isAuthorized, onLogout}: HeaderProps) => (
  <header className="header">
    <div className="container container--size-l">
      <Link className="logo header__logo" to="/" aria-label="Перейти на Главную">
        <svg width={LOGO_SIZE.width} height={LOGO_SIZE.height} aria-hidden="true">
          <use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#logo`} />
        </svg>
      </Link>

      <nav className="main-nav header__main-nav">
        <ul className="main-nav__list">
          <li className="main-nav__item">
            <NavLink className={({isActive}) => `link not-disabled${isActive ? ' active' : ''}`} to="/" end>
              Квесты
            </NavLink>
          </li>
          <li className="main-nav__item">
            <NavLink className={({isActive}) => `link${isActive ? ' active' : ''}`} to="/contacts">
              Контакты
            </NavLink>
          </li>
          {isAuthorized && (
            <li className="main-nav__item">
              <NavLink className={({isActive}) => `link${isActive ? ' active' : ''}`} to="/my-quests">
                Мои бронирования
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      <div className="header__side-nav">
        {isAuthorized ? (
          <button
            className="btn btn--accent header__side-item"
            type="button"
            onClick={() => {
              onLogout();
            }}
          >
            Выйти
          </button>
        ) : (
          <Link className="btn header__side-item header__login-btn" to="/login">
            Вход
          </Link>
        )}
        <a className="link header__side-item header__phone-link" href="tel:88003335599">8 (000) 111-11-11</a>
      </div>
    </div>
  </header>
);

export default Header;
