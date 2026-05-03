import {MAP_DEFAULT_CENTER} from '../constants/ui';
import {coordsToLeafletTuple} from '../utils/map-coords';
import {getStoredToken, requestJson} from './api-client';
import type {BookingDay, BookingPlace} from '../types/booking';

type QuestBookingSlotResponse = {
  time: string;
  isAvailable: boolean;
};

type QuestBookingPlacesResponse = {
  id: string;
  location: {
    address: string;
    coords: unknown;
  };
  slots: {
    today: QuestBookingSlotResponse[];
    tomorrow: QuestBookingSlotResponse[];
  };
};

type SlotRequestBody = {
  date: BookingDay;
  time: string;
  contactPerson: string;
  phone: string;
  withChildren: boolean;
  peopleCount: number;
  placeId: string;
};

const mapPlacesResponse = (places: QuestBookingPlacesResponse[]): BookingPlace[] => places.map((place) => ({
  id: place.id,
  address: place.location.address,
  coords: coordsToLeafletTuple(place.location.coords)
    ?? [...MAP_DEFAULT_CENTER] as [number, number],
  slots: [
    ...place.slots.today.map((slot) => ({
      id: `today-${slot.time}-${place.id}`,
      day: 'today' as BookingDay,
      time: slot.time,
      isAvailable: slot.isAvailable,
    })),
    ...place.slots.tomorrow.map((slot) => ({
      id: `tomorrow-${slot.time}-${place.id}`,
      day: 'tomorrow' as BookingDay,
      time: slot.time,
      isAvailable: slot.isAvailable,
    })),
  ],
}));

const getQuestBookingPlaces = async (questId: string): Promise<BookingPlace[]> => {
  const places = await requestJson<QuestBookingPlacesResponse[]>(`/quest/${questId}/booking`);
  return mapPlacesResponse(places);
};

const createBooking = async (questId: string, body: SlotRequestBody): Promise<void> => {
  const token = getStoredToken();
  await requestJson<void>(`/quest/${questId}/booking`, {
    method: 'POST',
    body,
    token,
    tokenRequired: true,
  });
};

type BookingRecord = {
  id: string;
  date: BookingDay;
  time: string;
  contactPerson: string;
  phone: string;
  withChildren: boolean;
  peopleCount: number;
  location: {
    address: string;
    coords: [number, number];
  };
  quest: {
    id: string;
    title: string;
    previewImg: string;
    previewImgWebp: string;
    level: 'easy' | 'medium' | 'hard';
    type: string;
    peopleMinMax: number[];
  };
};

const getMyBookings = async (): Promise<BookingRecord[]> => {
  const token = getStoredToken();
  const reservations = await requestJson<BookingRecord[]>('/reservation', {
    token,
    tokenRequired: true,
  });
  return reservations;
};

const cancelBooking = async (bookingId: string): Promise<void> => {
  const token = getStoredToken();
  await requestJson<void>(`/reservation/${bookingId}`, {
    method: 'DELETE',
    token,
    tokenRequired: true,
  });
};

export {cancelBooking, createBooking, getMyBookings, getQuestBookingPlaces};
export type {BookingRecord};

