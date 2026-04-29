type Importer = () => Promise<unknown>;

const prefetchOnce = (importer: Importer) => {
  let started = false;
  return () => {
    if (started) {
      return;
    }
    started = true;
    void importer();
  };
};

export {prefetchOnce};
