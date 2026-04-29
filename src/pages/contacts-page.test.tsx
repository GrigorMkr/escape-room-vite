import {screen} from '@testing-library/react';
import ContactsPage from './contacts-page';
import {renderWithProviders} from '../test-utils/render';

vi.mock('../components/contacts-map', () => ({
  default: () => <div data-testid="contacts-map" />,
}));

describe('ContactsPage', () => {
  it('renders contacts and map', () => {
    renderWithProviders(<ContactsPage />);

    expect(screen.getByRole('heading', {name: 'Контакты'})).toBeInTheDocument();
    expect(screen.getByText(/Набережная реки Карповка/i)).toBeInTheDocument();
    expect(screen.getByRole('link', {name: '8 (000) 111-11-11'})).toHaveAttribute('href', 'tel:88003335599');
    expect(screen.getByTestId('contacts-map')).toBeInTheDocument();
  });
});

