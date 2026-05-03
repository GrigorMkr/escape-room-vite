const isFiniteNumber = (value: unknown): value is number => (
  typeof value === 'number' && Number.isFinite(value)
);

const coerceNumber = (value: unknown): number | null => {
  if (isFiniteNumber(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const coordinatePairMatchesGeoJsonRussia = (lon: number, lat: number): boolean => (
  Math.abs(lon) >= 14
  && Math.abs(lon) <= 45
  && Math.abs(lat) >= 50
  && Math.abs(lat) <= 72
  && Math.abs(lon) < Math.abs(lat)
);

export function coordsToLeafletTuple(coords: unknown): [number, number] | null {
  if (coords === null || coords === undefined) {
    return null;
  }

  if (Array.isArray(coords)) {
    const a = coerceNumber(coords[0]);
    const b = coerceNumber(coords[1]);
    if (a === null || b === null) {
      return null;
    }

    const asLeafletOrder = (): [number, number] | null => {
      if (Math.abs(a) <= 90 && Math.abs(b) <= 180) {
        return [a, b];
      }
      if (Math.abs(b) <= 90 && Math.abs(a) <= 180) {
        return [b, a];
      }
      return null;
    };

    if (coordinatePairMatchesGeoJsonRussia(a, b)) {
      return [b, a];
    }

    return asLeafletOrder();
  }

  if (typeof coords !== 'object') {
    return null;
  }

  const record = coords as Record<string, unknown>;
  const lat = coerceNumber(record.lat ?? record.latitude);
  const lng = coerceNumber(record.lng ?? record.lon ?? record.longitude);

  if (lat === null || lng === null) {
    return null;
  }

  return [lat, lng];
}
