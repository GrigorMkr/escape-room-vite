import ContactsMap from './contacts-map';
import {renderWithProviders} from '../test-utils/render';

vi.mock('leaflet', () => {
  const marker = vi.fn(() => ({addTo: vi.fn()}));
  const tileLayer = vi.fn(() => ({addTo: vi.fn()}));
  const icon = vi.fn(() => ({}));
  const map = vi.fn(() => ({
    setView: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  }));
  return {default: {map, tileLayer, marker, icon}};
});

describe('ContactsMap', () => {
  it('renders without crashing', () => {
    const {container} = renderWithProviders(<ContactsMap />);
    expect(container.querySelector('.map__container')).toBeTruthy();
  });
});

