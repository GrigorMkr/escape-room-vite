import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookingDaySlots from './booking-day-slots';
import {renderWithProviders} from '../test-utils/render';
import type {BookingSlot} from '../types/booking';

const slots: BookingSlot[] = [
  {id: 's1', day: 'today', time: '12:00', isAvailable: true},
  {id: 's2', day: 'today', time: '13:00', isAvailable: false},
  {id: 's3', day: 'tomorrow', time: '14:00', isAvailable: true},
];

describe('BookingDaySlots', () => {
  it('renders only slots for selected day and calls onChange', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <BookingDaySlots
        title="Сегодня"
        day="today"
        name="slot"
        selectedSlotId=""
        slots={slots}
        onChange={onChange}
      />
    );

    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText('13:00')).toBeInTheDocument();
    expect(screen.queryByText('14:00')).not.toBeInTheDocument();

    expect(screen.getByLabelText('13:00')).toBeDisabled();

    await user.click(screen.getByLabelText('12:00'));
    expect(onChange).toHaveBeenCalledWith('s1');
  });
});

