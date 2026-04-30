import {Suspense, lazy, useCallback, useEffect, useRef} from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import Header from './components/header';
import PrivateRoute from './components/private-route';
import HomePage from './pages/home-page';
import {SOCIAL_ICON_SIZE} from './constants/ui';
import {checkAuthAction, loginAction, logoutAction} from './store/auth-slice';
import {useAppDispatch, useAppSelector} from './store/hooks';

const QuestPage = lazy(async () => await import('./pages/quest-page'));
const ContactsPage = lazy(async () => await import('./pages/contacts-page'));
const LoginPage = lazy(async () => await import('./pages/login-page'));
const BookingPage = lazy(async () => await import('./pages/booking-page'));
const MyBookingsPage = lazy(async () => await import('./pages/my-bookings-page'));
const NotFoundPage = lazy(async () => await import('./pages/not-found-page'));

const App = () => {
  const dispatch = useAppDispatch();
  const isAuthorized = useAppSelector((state) => state.auth.isAuthorized);
  const didCheckAuthRef = useRef(false);

  useEffect(() => {
    if (didCheckAuthRef.current) {
      return;
    }
    if (isAuthorized) {
      didCheckAuthRef.current = true;
      void dispatch(checkAuthAction());
    }
  }, [dispatch, isAuthorized]);

  const handleLogin = useCallback(async (email: string, password: string): Promise<void> => {
    await dispatch(loginAction({email, password})).unwrap();
  }, [dispatch]);

  const handleLogout = useCallback((): void => {
    void dispatch(logoutAction());
  }, [dispatch]);

  return (
    <div className="wrapper">
      <Header isAuthorized={isAuthorized} onLogout={handleLogout} />
      <Suspense
        fallback={(
          <main className="page-content">
            <div className="container">
              <h1 className="title title--size-m">Загрузка...</h1>
            </div>
          </main>
        )}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quest/:id" element={<QuestPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} isAuthorized={isAuthorized} />} />
          <Route
            path="/quest/:id/booking"
            element={(
              <PrivateRoute isAuthorized={isAuthorized}>
                <BookingPage />
              </PrivateRoute>
            )}
          />
          <Route
            path="/my-quests"
            element={(
              <PrivateRoute isAuthorized={isAuthorized}>
                <MyBookingsPage />
              </PrivateRoute>
            )}
          />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>

      <footer className="footer">
        <div className="container container--size-l">
          <div className="socials">
            <ul className="socials__list">
              <li className="socials__item">
                <a className="socials__link" href="#" aria-label="Skype">
                  <svg
                    className="socials__icon socials__icon--default"
                    width={SOCIAL_ICON_SIZE}
                    height={SOCIAL_ICON_SIZE}
                    aria-hidden="true"
                  >
                    <use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#icon-skype-default`} />
                  </svg>
                  <svg
                    className="socials__icon socials__icon--interactive"
                    width={SOCIAL_ICON_SIZE}
                    height={SOCIAL_ICON_SIZE}
                    aria-hidden="true"
                  >
                    <use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#icon-skype-interactive`} />
                  </svg>
                </a>
              </li>

              <li className="socials__item">
                <a className="socials__link" href="#" aria-label="ВКонтакте">
                  <svg
                    className="socials__icon socials__icon--default"
                    width={SOCIAL_ICON_SIZE}
                    height={SOCIAL_ICON_SIZE}
                    aria-hidden="true"
                  >
                    <use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#icon-vk-default`} />
                  </svg>
                  <svg
                    className="socials__icon socials__icon--interactive"
                    width={SOCIAL_ICON_SIZE}
                    height={SOCIAL_ICON_SIZE}
                    aria-hidden="true"
                  >
                    <use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#icon-vk-interactive`} />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
