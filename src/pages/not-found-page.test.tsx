import {screen} from '@testing-library/react';
import {Route, Routes} from 'react-router-dom';
import NotFoundPage from './not-found-page';
import {renderWithProviders} from '../test-utils/render';

describe('NotFoundPage', () => {
  it('renders 404 and link to home', () => {
    renderWithProviders(
      <Routes>
        <Route path="/404" element={<NotFoundPage />} />
      </Routes>,
      {route: '/404'}
    );

    expect(screen.getByRole('heading', {name: '404'})).toBeInTheDocument();
    expect(screen.getByText('Страница не найдена')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Перейти на главную'})).toHaveAttribute('href', '/');
  });
});

