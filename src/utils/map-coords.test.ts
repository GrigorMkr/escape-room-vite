import {describe, expect, it} from 'vitest';
import {coordsToLeafletTuple} from './map-coords';

describe('coordsToLeafletTuple', () => {
  it('keeps academy-style [lat, lng] for SPB', () => {
    expect(coordsToLeafletTuple([59.96831, 30.31748])).toEqual([59.96831, 30.31748]);
  });

  it('converts geojson-ish [lng, lat] pairs near SPB to Leaflet order', () => {
    expect(coordsToLeafletTuple([30.31748, 59.96831])).toEqual([59.96831, 30.31748]);
  });

  it('reads latitude/longitude object form', () => {
    expect(coordsToLeafletTuple({latitude: '59.9', longitude: '30.3'})).toEqual([59.9, 30.3]);
    expect(coordsToLeafletTuple({lat: 60, lng: 30.31})).toEqual([60, 30.31]);
  });

  it('returns null for invalid payloads', () => {
    expect(coordsToLeafletTuple(null)).toBeNull();
    expect(coordsToLeafletTuple(undefined)).toBeNull();
    expect(coordsToLeafletTuple({})).toBeNull();
    expect(coordsToLeafletTuple([NaN, 1])).toBeNull();
  });
});
