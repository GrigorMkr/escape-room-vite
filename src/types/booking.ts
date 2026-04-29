type BookingDay = 'today' | 'tomorrow';

type BookingSlot = {
  id: string;
  time: string;
  day: BookingDay;
  isAvailable: boolean;
};

type BookingPlace = {
  id: string;
  address: string;
  coords: [number, number];
  slots: BookingSlot[];
};

export type {BookingDay, BookingPlace, BookingSlot};

