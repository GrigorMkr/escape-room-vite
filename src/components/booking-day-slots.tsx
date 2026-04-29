import {type ChangeEvent, useCallback, useMemo} from 'react';
import type {BookingDay, BookingSlot} from '../types/booking';

type BookingDaySlotsProps = {
  title: string;
  day: BookingDay;
  name: string;
  selectedSlotId: string;
  slots: BookingSlot[];
  onChange: (slotId: string) => void;
};

const BookingDaySlots = ({
  title,
  day,
  name,
  selectedSlotId,
  slots,
  onChange,
}: BookingDaySlotsProps) => {
  const daySlots = useMemo(
    () => slots.filter((s) => s.day === day),
    [day, slots]
  );

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value);
  }, [onChange]);

  return (
    <fieldset className="booking-form__date-section">
      <legend className="booking-form__date-title">{title}</legend>
      <div className="booking-form__date-inner-wrapper">
        {daySlots.map((slot) => (
          <label key={slot.id} className="custom-radio booking-form__date">
            <input
              type="radio"
              id={slot.id}
              name={name}
              value={slot.id}
              checked={selectedSlotId === slot.id}
              disabled={!slot.isAvailable}
              onChange={handleChange}
            />
            <span className="custom-radio__label">{slot.time}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};

export default BookingDaySlots;
