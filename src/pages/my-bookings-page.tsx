import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import ErrorBox from '../components/error-box';
import {QUEST_CARD_IMAGE_SIZE} from '../constants/ui';
import {cancelBooking, getMyBookings, type BookingRecord} from '../services/bookings-api';
import {
  academyCatalogPreview,
  getCatalogCardPictureSources,
  getGradingQuestSlugFromUrl,
} from '../utils/academy-catalog-preview';

const MY_BOOKINGS_DECOR_LAYER_SIZE = {
  width: 1366,
  height: 1959,
} as const;

const previewAssetOpts = {assetBaseUrl: import.meta.env.BASE_URL};
const bookingCardBaseUrl = import.meta.env.BASE_URL;

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

type BookingsGridProps = Readonly<{
  bookings: BookingRecord[];
  isCancelling: string | null;
  onCancelBooking: (id: string) => Promise<void>;
}>;

function renderBookingsGrid({
  bookings,
  isCancelling,
  onCancelBooking,
}: BookingsGridProps) {
  return (
    <div className="cards-grid">
      {bookings.map((booking) => {
        const slug = getGradingQuestSlugFromUrl(booking.quest.previewImg ?? '');
        const markupCard = slug ? getCatalogCardPictureSources(slug, bookingCardBaseUrl) : null;

        let webpPreview = academyCatalogPreview(booking.quest.previewImgWebp, previewAssetOpts);
        let webpPreview2x = academyCatalogPreview(booking.quest.previewImgWebp, {
          ...previewAssetOpts,
          retina: true,
        });
        let jpgPreview = academyCatalogPreview(booking.quest.previewImg ?? '', previewAssetOpts);
        let jpgPreview2x = academyCatalogPreview(booking.quest.previewImg ?? '', {
          ...previewAssetOpts,
          retina: true,
        });

        if (markupCard !== null) {
          webpPreview = markupCard.webp;
          webpPreview2x = markupCard.webp2x;
          jpgPreview = markupCard.jpg;
          jpgPreview2x = markupCard.jpg2x;
        }

        const wrapClassNames = slug === 'maniac'
          ? 'quest-card__img quest-card__img--image-center'
          : 'quest-card__img';

        return (
          <div key={booking.id} className="quest-card">
            <div className={wrapClassNames}>
              <picture>
                <source type="image/webp" srcSet={`${webpPreview} 1x, ${webpPreview2x} 2x`} />
                <img
                  src={jpgPreview}
                  srcSet={`${jpgPreview2x} 2x`}
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
                  {booking.peopleCount}
                  {'\u00A0'}
                чел
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
                  void onCancelBooking(booking.id);
                }}
                disabled={isCancelling === booking.id}
              >
                {isCancelling === booking.id ? 'Отмена...' : 'Отменить'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const list = await getMyBookings();
        if (!cancelled) {
          setBookings(list);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Не удалось загрузить бронирования.');
        }
      }
      if (!cancelled) {
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCancelBooking = async (bookingId: string): Promise<void> => {
    setError('');
    setIsCancelling(bookingId);
    try {
      await cancelBooking(bookingId);
      setBookings((previous) => previous.filter((booking) => booking.id !== bookingId));
    } catch {
      setError('Не удалось отменить бронирование. Попробуйте ещё раз.');
    } finally {
      setIsCancelling(null);
    }
  };

  let bookingsBody;
  if (isLoading) {
    bookingsBody = <p>Загрузка бронирований...</p>;
  } else if (bookings.length === 0) {
    bookingsBody = <p>У вас пока нет бронирований.</p>;
  } else {
    bookingsBody = renderBookingsGrid({
      bookings,
      isCancelling,
      onCancelBooking: handleCancelBooking,
    });
  }

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
            width={MY_BOOKINGS_DECOR_LAYER_SIZE.width}
            height={MY_BOOKINGS_DECOR_LAYER_SIZE.height}
            alt=""
          />
        </picture>
      </div>
      <div className="container">
        <div className="page-content__title-wrapper">
          <h1 className="title title--size-m">Мои бронирования</h1>
        </div>

        <ErrorBox errors={error ? [error] : []} ariaLive="polite" />

        {bookingsBody}
      </div>
    </main>
  );
};

export default MyBookingsPage;
