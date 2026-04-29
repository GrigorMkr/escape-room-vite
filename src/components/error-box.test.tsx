import {screen} from '@testing-library/react';
import ErrorBox from './error-box';
import {renderWithProviders} from '../test-utils/render';

describe('ErrorBox', () => {
  it('renders nothing when errors empty', () => {
    const {container} = renderWithProviders(<ErrorBox errors={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders list of errors with alert role', () => {
    renderWithProviders(<ErrorBox errors={['A', 'B']} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});

