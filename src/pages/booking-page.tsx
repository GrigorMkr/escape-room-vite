import {type FocusEvent, useEffect, useMemo, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {useNavigate, useParams} from 'react-router-dom';
import {type BookingPlace, type BookingDay} from '../types/booking';
import BookingDaySlots from '../components/booking-day-slots';
import BookingMap from '../components/booking-map';
import ErrorBox from '../components/error-box';
import {createBooking, getQuestBookingPlaces} from '../services/bookings-api';
import {getQuest, type QuestDetailResponse} from '../services/quests-api';

type BookingFormValues = {
  name: string;
  tel: string;
  person: number;
  slotId: string;
  children: boolean;
  agreement: boolean;
};

// Required format: +7 (000) 000-00-00
const phoneRegex = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/;
const nameRegex = /^[A-Za-zА-Яа-яЁё' -]{1,15}$/;

const formatPhoneDisplay = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  // Accept input like "+79871234567" or "89871234567" and format to "+7 (987) 123-45-67"
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

  const onSubmit = async (values: BookingFormValues) => {
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
  };

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
      <div className="page-content__item">
        <div className="container container--size-s">
          <div className="page-content__title-wrapper">
            <h1 className="subtitle subtitle--size-l page-content__subtitle">Бронирование квеста</h1>
            <p className="title title--size-m title--uppercase page-content__title">{quest.title}</p>
          </div>

          <div className="booking-map">
            <div className="map">
              <BookingMap
                places={places}
                selectedPlaceId={selectedPlaceId}
                onSelectPlace={(placeId) => {
                  setSelectedPlaceId(placeId);
                }}
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
            onSubmit={(evt) => {
              void handleSubmit(onSubmit)(evt);
            }}
          >
            <ErrorBox
              errors={[
                ...(submitError ? [submitError] : []),
                ...Object.values(errors)
                  .map((e) => e?.message)
                  .filter((m): m is string => Boolean(m)),
              ]}
              ariaLive="polite"
            />

            <fieldset className="booking-form__section">
              <legend className="visually-hidden">Выбор даты и времени</legend>

              <Controller
                name="slotId"
                control={control}
                rules={{required: 'Выберите время бронирования.'}}
                render={({field}) => (
                  <>
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
                  </>
                )}
              />
            </fieldset>

            <fieldset className="booking-form__section">
              <legend className="visually-hidden">Контактная информация</legend>

              <div className="custom-input booking-form__input">
                <label className="custom-input__label" htmlFor="name">Ваше имя</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Имя"
                  {...register('name', {
                    validate: (v) => {
                      const trimmed = v.trim();
                      if (!trimmed) {
                        return 'Введите имя.';
                      }
                      if (!nameRegex.test(trimmed)) {
                        return 'Имя должно содержать 1-15 символов.';
                      }
                      return true;
                    },
                  })}
                />
              </div>

              <div className="custom-input booking-form__input">
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
                      if (!phoneRegex.test(trimmed)) {
                        return 'Телефон должен быть в формате +7 (000) 000-00-00.';
                      }
                      return true;
                    },
                  })}
                />
              </div>

              <div className="custom-input booking-form__input">
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
                />
              </div>

              <label className="custom-checkbox booking-form__checkbox booking-form__checkbox--children">
                <input
                  type="checkbox"
                  {...register('children')}
                />
                <span className="custom-checkbox__icon">
                  <svg width="20" height="17" aria-hidden="true">
                    <use xlinkHref="#icon-tick" />
                  </svg>
                </span>
                <span className="custom-checkbox__label">Со&nbsp;мной будут дети</span>
              </label>
            </fieldset>

            <label className="custom-checkbox booking-form__checkbox booking-form__checkbox--agreement">
              <input
                type="checkbox"
                {...register('agreement', {
                  validate: (v) => v || 'Необходимо согласие на обработку персональных данных.',
                })}
              />
              <span className="custom-checkbox__icon">
                <svg width="20" height="17" aria-hidden="true">
                  <use xlinkHref="#icon-tick" />
                </svg>
              </span>
              <span className="custom-checkbox__label">
                Я&nbsp;согласен с&nbsp;условиями обработки персональных данных и&nbsp;принимаю условия пользовательского соглашения
              </span>
            </label>

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

