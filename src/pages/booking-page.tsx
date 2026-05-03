import {type BaseSyntheticEvent, type FocusEvent, useCallback, useEffect, useMemo, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {useNavigate, useParams} from 'react-router-dom';
import {type BookingPlace, type BookingDay} from '../types/booking';
import BookingDaySlots from '../components/booking-day-slots';
import BookingMap from '../components/booking-map';
import ErrorBox from '../components/error-box';
import {BOOKING_FORM_PHONE_DISPLAY_REGEX, CONTACT_NAME_REGEX} from '../constants/validation';
import {createBooking, getQuestBookingPlaces} from '../services/bookings-api';
import {getQuest, type QuestDetailResponse} from '../services/quests-api';

const BOOKING_BACKGROUND_DECOR_SIZE = {
  width: 1366,
  height: 1959,
} as const;

type BookingFormValues = {
  name: string;
  tel: string;
  person: number;
  slotId: string;
  children: boolean;
  agreement: boolean;
};

const formatPhoneDisplay = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const normalized = digits.startsWith('8') ? `7${digits.slice(1)}` : digits;
  if (!normalized.startsWith('7') || normalized.length !== 11) {
    return value;
  }
  const code = normalized.slice(1, 4);
  const p1 = normalized.slice(4, 7);
  const p2 = normalized.slice(7, 9);
  const p3 = normalized.slice(9, 11);
  return `+7 (${code}) ${p1}-${p2}-${p3}`;
};

const normalizePhoneForServer = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('7')) {
    return `8${digits.slice(1)}`;
  }
  return digits;
};

const getPeopleMinMax = (value: number[]): {min: number; max: number} => {
  if (value.length >= 2) {
    return {min: value[0], max: value[1]};
  }
  if (value.length === 1) {
    return {min: value[0], max: value[0]};
  }
  return {min: 2, max: 5};
};

const BookingPage = () => {
  const {id: questId} = useParams();
  const navigate = useNavigate();

  const [quest, setQuest] = useState<QuestDetailResponse | null>(null);
  const [placesLoadingError, setPlacesLoadingError] = useState<string>('');

  const [places, setPlaces] = useState<BookingPlace[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('');

  const handleSelectPlace = useCallback((placeId: string) => {
    setSelectedPlaceId(placeId);
  }, []);

  const selectedPlace = useMemo(
    () => places.find((p) => p.id === selectedPlaceId) ?? places[0],
    [places, selectedPlaceId]
  );

  const firstAvailableSlotId = useMemo(() => {
    if (!selectedPlace) {
      return '';
    }
    return selectedPlace.slots.find((s) => s.isAvailable)?.id ?? selectedPlace.slots[0]?.id ?? '';
  }, [selectedPlace]);

  const {min: minPeople, max: maxPeople} = useMemo(() => {
    const minMax = quest?.peopleMinMax ?? [];
    return getPeopleMinMax(minMax);
  }, [quest]);

  const firstAvailablePersonDefault = minPeople;

  const [submitError, setSubmitError] = useState<string>('');

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: {errors},
  } = useForm<BookingFormValues>({
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      tel: '',
      person: firstAvailablePersonDefault,
      slotId: firstAvailableSlotId,
      children: false,
      agreement: false,
    },
  });

  const serverSubmitErrors = useMemo(() => (submitError ? [submitError] : []), [submitError]);

  useEffect(() => {
    if (!questId) {
      return;
    }
    let cancelled = false;
    setPlacesLoadingError('');
    void (async () => {
      try {
        const data = await getQuest(questId);
        if (!cancelled) {
          setQuest(data);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        setQuest(null);
        setPlacesLoadingError(err instanceof Error ? err.message : 'Не удалось загрузить квест.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [questId]);

  useEffect(() => {
    if (!questId) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const nextPlaces = await getQuestBookingPlaces(questId);
        if (cancelled) {
          return;
        }
        setPlaces(nextPlaces);
        setSelectedPlaceId(nextPlaces[0]?.id ?? '');
      } catch (err) {
        if (cancelled) {
          return;
        }
        setPlaces([]);
        setSelectedPlaceId('');
        setPlacesLoadingError(err instanceof Error ? err.message : 'Не удалось загрузить места бронирования.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [questId]);

  useEffect(() => {
    if (!firstAvailableSlotId) {
      return;
    }
    setValue('slotId', firstAvailableSlotId, {shouldValidate: true});
  }, [firstAvailableSlotId, setValue]);

  useEffect(() => {
    setValue('person', minPeople);
  }, [minPeople, setValue]);

  const onSubmit = useCallback(async (values: BookingFormValues) => {
    setSubmitError('');
    if (!quest || !questId || !selectedPlace) {
      return;
    }

    const slot = selectedPlace.slots.find((s) => s.id === values.slotId);
    if (!slot) {
      setSubmitError('Не удалось выбрать время бронирования. Попробуйте ещё раз.');
      return;
    }

    if (!slot.isAvailable) {
      setSubmitError('Выбранное время больше недоступно.');
      return;
    }

    try {
      const date: BookingDay = slot.day;
      const phone = normalizePhoneForServer(values.tel);
      await createBooking(questId, {
        date,
        time: slot.time,
        contactPerson: values.name.trim(),
        phone,
        withChildren: values.children,
        peopleCount: values.person,
        placeId: selectedPlace.id,
      });

      navigate('/my-quests', {replace: true});
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Не удалось отправить заявку.');
    }
  }, [navigate, quest, questId, selectedPlace]);

  const handleFormSubmit = useCallback((evt: BaseSyntheticEvent) => {
    void handleSubmit(onSubmit)(evt);
  }, [handleSubmit, onSubmit]);

  if (!quest) {
    return (
      <main className="page-content">
        <div className="container">
          {placesLoadingError ? <p>{placesLoadingError}</p> : <h1 className="title title--size-m">Квест не найден</h1>}
        </div>
      </main>
    );
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
            width={BOOKING_BACKGROUND_DECOR_SIZE.width}
            height={BOOKING_BACKGROUND_DECOR_SIZE.height}
            alt=""
          />
        </picture>
      </div>

      <div className="container container--size-s">
        <div className="page-content__title-wrapper">
          <h1 className="subtitle subtitle--size-l page-content__subtitle">Бронирование квеста</h1>
          <p className="title title--size-m title--uppercase page-content__title">{quest.title}</p>
        </div>

        <div className="page-content__item">

          <div className="booking-map">
            <div className="map">
              <BookingMap
                places={places}
                selectedPlaceId={selectedPlaceId}
                onSelectPlace={handleSelectPlace}
              />
            </div>
            <p className="booking-map__address">
              Вы&nbsp;выбрали: {selectedPlace?.address ?? ''}
            </p>
          </div>

          <ErrorBox errors={placesLoadingError ? [placesLoadingError] : []} ariaLive="polite" />

          <form
            className="booking-form"
            action="#"
            method="post"
            onSubmit={handleFormSubmit}
          >
            <ErrorBox
              errors={serverSubmitErrors}
              ariaLive="polite"
            />

            <fieldset className="booking-form__section">
              <legend className="visually-hidden">Выбор даты и времени</legend>

              <Controller
                name="slotId"
                control={control}
                rules={{required: 'Выберите время бронирования.'}}
                render={({field, fieldState}) => (
                  <div className={fieldState.error === undefined ? 'booking-form__slot-groups' : 'booking-form__slot-groups booking-form__slot-groups--invalid'}>
                    <BookingDaySlots
                      title="Сегодня"
                      day="today"
                      name={field.name}
                      selectedSlotId={field.value}
                      slots={selectedPlace?.slots ?? []}
                      onChange={field.onChange}
                    />

                    <BookingDaySlots
                      title="Завтра"
                      day="tomorrow"
                      name={field.name}
                      selectedSlotId={field.value}
                      slots={selectedPlace?.slots ?? []}
                      onChange={field.onChange}
                    />
                    {fieldState.error?.message ? (
                      <p id="booking-slot-error" className="booking-form__field-error booking-form__field-error--slots" role="alert">
                        {fieldState.error.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
            </fieldset>

            <fieldset className="booking-form__section">
              <legend className="visually-hidden">Контактная информация</legend>

              <div className={`custom-input booking-form__input${errors.name ? ' is-invalid' : ''}`}>
                <label className="custom-input__label" htmlFor="name">Ваше имя</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Имя"
                  autoComplete="name"
                  {...register('name', {
                    validate: (v) => {
                      const trimmed = v.trim();
                      if (!trimmed) {
                        return 'Введите имя.';
                      }
                      if (!CONTACT_NAME_REGEX.test(trimmed)) {
                        return 'Имя должно содержать 1-15 символов.';
                      }
                      return true;
                    },
                  })}
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'booking-name-error' : undefined}
                />
                {errors.name?.message ? (
                  <span id="booking-name-error" className="booking-form__field-error" role="alert">
                    {errors.name.message}
                  </span>
                ) : null}
              </div>

              <div className={`custom-input booking-form__input${errors.tel ? ' is-invalid' : ''}`}>
                <label className="custom-input__label" htmlFor="tel">Контактный телефон</label>
                <input
                  id="tel"
                  type="tel"
                  placeholder="+7 (000) 000-00-00"
                  inputMode="tel"
                  {...register('tel', {
                    onBlur: (e: FocusEvent<HTMLInputElement>) => {
                      const value = e.currentTarget.value;
                      const formatted = formatPhoneDisplay(value);
                      if (formatted !== value) {
                        setValue('tel', formatted, {shouldValidate: true});
                      }
                    },
                    validate: (v) => {
                      const trimmed = v.trim();
                      if (!trimmed) {
                        return 'Введите телефон.';
                      }
                      if (!BOOKING_FORM_PHONE_DISPLAY_REGEX.test(trimmed)) {
                        return 'Телефон должен быть в формате +7 (000) 000-00-00.';
                      }
                      return true;
                    },
                  })}
                  aria-invalid={errors.tel ? 'true' : 'false'}
                  aria-describedby={errors.tel ? 'booking-tel-error' : undefined}
                />
                {errors.tel?.message ? (
                  <span id="booking-tel-error" className="booking-form__field-error" role="alert">
                    {errors.tel.message}
                  </span>
                ) : null}
              </div>

              <div className={`custom-input booking-form__input${errors.person ? ' is-invalid' : ''}`}>
                <label className="custom-input__label" htmlFor="person">Количество участников</label>
                <input
                  id="person"
                  type="number"
                  placeholder="Количество участников"
                  {...register('person', {
                    valueAsNumber: true,
                    validate: (v) => {
                      if (!quest) {
                        return true;
                      }
                      if (!Number.isFinite(v)) {
                        return 'Введите количество участников.';
                      }
                      if (v < minPeople || v > maxPeople) {
                        return `Количество участников должно быть от ${minPeople} до ${maxPeople}.`;
                      }
                      return true;
                    },
                  })}
                  aria-invalid={errors.person ? 'true' : 'false'}
                  aria-describedby={errors.person ? 'booking-person-error' : undefined}
                />
                {errors.person?.message ? (
                  <span id="booking-person-error" className="booking-form__field-error" role="alert">
                    {errors.person.message}
                  </span>
                ) : null}
              </div>

              <label className="custom-checkbox booking-form__checkbox booking-form__checkbox--children">
                <input
                  type="checkbox"
                  {...register('children')}
                />
                <span className="custom-checkbox__icon">
                  <svg width="20" height="17" aria-hidden="true">
                    <use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#icon-tick`} />
                  </svg>
                </span>
                <span className="custom-checkbox__label">Со&nbsp;мной будут дети</span>
              </label>
            </fieldset>

            <div className="booking-form__agreement-block">
              <label className={`custom-checkbox booking-form__checkbox booking-form__checkbox--agreement${errors.agreement ? ' is-invalid' : ''}`}>
                <input
                  type="checkbox"
                  {...register('agreement', {
                    validate: (v) => v || 'Необходимо согласие на обработку персональных данных.',
                  })}
                  aria-invalid={errors.agreement ? 'true' : 'false'}
                  aria-describedby={errors.agreement ? 'booking-agreement-error' : undefined}
                />
                <span className="custom-checkbox__icon">
                  <svg width="20" height="17" aria-hidden="true">
                    <use xlinkHref={`${import.meta.env.BASE_URL}img/sprite.svg#icon-tick`} />
                  </svg>
                </span>
                <span className="custom-checkbox__label">
                  Я&nbsp;согласен с&nbsp;условиями обработки персональных данных и&nbsp;принимаю условия пользовательского соглашения
                </span>
              </label>
              {errors.agreement?.message ? (
                <p id="booking-agreement-error" className="booking-form__field-error booking-form__field-error--after-checkbox" role="alert">
                  {errors.agreement.message}
                </p>
              ) : null}
            </div>

            <button className="btn btn--accent btn--cta booking-form__submit" type="submit">
              Забронировать
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default BookingPage;

