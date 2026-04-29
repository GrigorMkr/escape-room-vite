import matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

expect.extend(matchers);

class ResizeObserverMock {
  observe() {
    void 0;
  }

  unobserve() {
    void 0;
  }

  disconnect() {
    void 0;
  }
}

if (!('ResizeObserver' in window)) {
  // @ts-expect-error test environment polyfill
  window.ResizeObserver = ResizeObserverMock;
}
