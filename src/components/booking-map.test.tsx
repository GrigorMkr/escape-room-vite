import BookingMap from './booking-map';
import {renderWithProviders} from '../test-utils/render';
import type {BookingPlace} from '../types/booking';

vi.mock('leaflet', () => {
  const map = vi.fn(() => ({
    setView: vi.fn().mockReturnThis(),
    getZoom: vi.fn(() => 12),
    invalidateSize: vi.fn(),
    hasLayer: vi.fn(() => true),
    remove: vi.fn(),
  }));
  const marker = vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    setIcon: vi.fn(),
  }));
  const tileLayer = vi.fn(() => ({addTo: vi.fn(), remove: vi.fn()}));
  const icon = vi.fn(() => ({}));
  return {default: {map, tileLayer, marker, icon}};
});

const places: BookingPlace[] = [
  {id: 'p1', address: 'A1', coords: [59.9, 30.3], slots: []},
  {id: 'p2', address: 'A2', coords: [30.3, 59.9], slots: []},
  {id: 'p3', address: 'A3', coords: [999, 999], slots: []},
];

describe('BookingMap', () => {
  it('renders container and initializes map', () => {
    const {container} = renderWithProviders(
      <BookingMap places={places} selectedPlaceId="p1" onSelectPlace={vi.fn()} />
    );
    expect(container.querySelector('.map__container')).toBeTruthy();
  });
});

