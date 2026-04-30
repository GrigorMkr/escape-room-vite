import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import ErrorBox from '../components/error-box';
import {HERO_IMAGE_SIZE, QUEST_CARD_IMAGE_SIZE} from '../constants/ui';
import {cancelBooking, getMyBookings, type BookingRecord} from '../services/bookings-api';

const getDifficultyLabel = (difficulty: 'easy' | 'medium' | 'hard'): string => {
  switch (difficulty) {
    case 'easy':
      return 'Лёгкий';
    case 'medium':
      return 'Средний';
    case 'hard':
      return 'Сложный';
    default:
      return difficulty;
  }
};

const getDayLabel = (day: string): string => {
  switch (day) {
    case 'today':
      return 'сегодня';
    case 'tomorrow':
      return 'завтра';
    default:
      return day;
  }
};

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const list = await getMyBookings();
        setBookings(list);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить бронирования.');
      }
    })();
  }, []);

  const handleCancel = async (id: string) => {
    setError('');
    setIsCancelling(id);
    try {
      await cancelBooking(id);
      setBookings((prev) => prev.filter((booking) => booking.id !== id));
    } catch {
      setError('Не удалось отменить бронирование. Попробуйте ещё раз.');
    } finally {
      setIsCancelling(null);
    }
  };

  return (
    <main className="page-content decorated-page">
      <div className="decorated-page__decor" aria-hidden="true">
        <picture>
          <source
            type="image/webp"
            srcSet={`${import.meta.env.BASE_URL}img/content/maniac/maniac-bg-size-m.webp, ${import.meta.env.BASE_URL}img/content/maniac/maniac-bg-size-m@2x.webp 2x`}
          />
          <img
            src={`${import.meta.env.BASE_URL}img/content/maniac/maniac-bg-size-m.jpg`}
            srcSet={`${import.meta.env.BASE_URL}img/content/maniac/maniac-bg-size-m@2x.jpg 2x`}
            width={HERO_IMAGE_SIZE.width}
            height={HERO_IMAGE_SIZE.height}
            alt=""
          />
        </picture>
      </div>
      <div className="container">
        <div className="page-content__title-wrapper">
          <h1 className="title title--size-m">Мои бронирования</h1>
        </div>

        <ErrorBox errors={error ? [error] : []} ariaLive="polite" />

        {bookings.length === 0 ? (
          <p>У вас пока нет бронирований.</p>
        ) : (
          <div className="cards-grid">
            {bookings.map((booking) => (
              <div key={booking.id} className="quest-card">
                <div className="quest-card__img">
                  <picture>
                    <img
                      src={booking.quest.previewImg ?? ''}
                      width={QUEST_CARD_IMAGE_SIZE.width}
                      height={QUEST_CARD_IMAGE_SIZE.height}
                      alt={booking.quest.title}
                    />
                  </picture>
                </div>

                <div className="quest-card__content">
                  <div className="quest-card__info-wrapper">
                    <Link className="quest-card__link" to={`/quest/${booking.quest.id}`}>
                      {booking.quest.title}
                    </Link>
                    <span className="quest-card__info">
                      [{getDayLabel(booking.date)}, {booking.time}. {booking.location.address}]
                    </span>
                  </div>

                  <ul className="tags quest-card__tags">
                    <li className="tags__item">
                      <svg width="11" height="14" aria-hidden="true">
                        <use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#icon-person`} />
                      </svg>
                      {booking.peopleCount} чел
                    </li>
                    <li className="tags__item">
                      <svg width="14" height="14" aria-hidden="true">
                        <use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#icon-level`} />
                      </svg>
                      {getDifficultyLabel(booking.quest.level)}
                    </li>
                  </ul>

                  <button
                    className="btn btn--accent btn--secondary quest-card__btn"
                    type="button"
                    onClick={() => {
                      void handleCancel(booking.id);
                    }}
                    disabled={isCancelling === booking.id}
                  >
                    {isCancelling === booking.id ? 'Отмена...' : 'Отменить'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyBookingsPage;

