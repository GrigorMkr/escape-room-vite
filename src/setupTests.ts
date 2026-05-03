import matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

expect.extend(matchers);

class ResizeObserverMock {
  observe(): void {
    void 0;
  }

  unobserve(): void {
    void 0;
  }

  disconnect(): void {
    void 0;
  }
}

if (!('ResizeObserver' in window)) {
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserverMock,
  });
}
