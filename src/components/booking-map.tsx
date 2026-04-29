import {useEffect, useMemo, useRef, useState} from 'react';
import L from 'leaflet';
import type {BookingPlace} from '../types/booking';
import {MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, PIN_ICON_ANCHOR, PIN_ICON_SIZE} from '../constants/ui';

type BookingMapProps = {
  places: BookingPlace[];
  selectedPlaceId: string;
  onSelectPlace: (placeId: string) => void;
};

const createMarkerIcon = (active: boolean): L.Icon => (
  L.icon({
    iconUrl: active
      ? `${import.meta.env.BASE_URL}img/svg/pin-active.svg`
      : `${import.meta.env.BASE_URL}img/svg/pin-default.svg`,
    iconSize: PIN_ICON_SIZE,
    iconAnchor: PIN_ICON_ANCHOR,
  })
);

const normalizeLatLng = (coords: [number, number] | undefined): [number, number] | null => {
  if (!coords) {
    return null;
  }

  const a = Number(coords[0]);
  const b = Number(coords[1]);

  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return null;
  }

  const asIsValid = Math.abs(a) <= 90 && Math.abs(b) <= 180;
  if (asIsValid) {
    return [a, b];
  }

  const swappedValid = Math.abs(b) <= 90 && Math.abs(a) <= 180;
  if (swappedValid) {
    return [b, a];
  }

  return null;
};

const BookingMap = ({
  places,
  selectedPlaceId,
  onSelectPlace,
}: BookingMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [mapInitError, setMapInitError] = useState<string>('');

  const placesWithCoords = useMemo(
    () => places
      .map((place) => ({place, coords: normalizeLatLng(place.coords)}))
      .filter((x): x is {place: BookingPlace; coords: [number, number]} => x.coords !== null),
    [places]
  );

  const selectedPlace = useMemo(() => (
    placesWithCoords.find((p) => p.place.id === selectedPlaceId) ?? placesWithCoords[0] ?? null
  ), [placesWithCoords, selectedPlaceId]);

  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    const rect = mapContainerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      setMapInitError('Контейнер карты имеет нулевой размер. Проверьте стили блока карты.');
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
    } else if (mapInitError) {
      setMapInitError('');
    }

    const nextCenter = selectedPlace?.coords ?? MAP_DEFAULT_CENTER;

    const map = (() => {
      if (mapRef.current) {
        return mapRef.current;
      }

      const container = mapContainerRef.current as unknown as {_leaflet_id?: unknown};
      if (container._leaflet_id) {
        delete container._leaflet_id;
      }

      try {
        return L.map(mapContainerRef.current, {zoomControl: false}).setView(nextCenter, MAP_DEFAULT_ZOOM);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Не удалось инициализировать карту.';
        setMapInitError(msg);
        throw e;
      }
    })();

    mapRef.current = map;
    if (!tileLayerRef.current) {
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      });
      tileLayerRef.current.addTo(map);
    }

    map.setView(nextCenter as L.LatLngExpression, map.getZoom() || MAP_DEFAULT_ZOOM, {animate: false});
    setTimeout(() => map.invalidateSize(), 50);

    if (!resizeObserverRef.current && 'ResizeObserver' in window) {
      resizeObserverRef.current = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserverRef.current.observe(mapContainerRef.current);
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    const createdMarkers: L.Marker[] = [];
    placesWithCoords.forEach(({place, coords}) => {
      const marker = L.marker(coords as L.LatLngExpression, {
        icon: createMarkerIcon(place.id === selectedPlaceId),
      });

      marker.on('click', () => onSelectPlace(place.id));
      marker.addTo(map);
      markersRef.current.set(place.id, marker);
      createdMarkers.push(marker);
    });

    return () => {
      createdMarkers.forEach((marker) => marker.remove());
    };
  }, [placesWithCoords, selectedPlace?.coords, selectedPlaceId, onSelectPlace, mapInitError]);

  useEffect(() => {
    markersRef.current.forEach((marker, placeId) => {
      marker.setIcon(createMarkerIcon(placeId === selectedPlaceId));
    });
  }, [selectedPlaceId]);

  useEffect(() => () => {
    const markersToRemove = Array.from(markersRef.current.values());
    markersToRemove.forEach((marker) => marker.remove());
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = null;
    tileLayerRef.current?.remove();
    tileLayerRef.current = null;
    mapRef.current?.remove();
    mapRef.current = null;
  }, []);

  return (
    <div className="map__container" ref={mapContainerRef}>
      {mapInitError ? (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          padding: 16,
          color: '#000',
          background: '#d9d9d9',
          textAlign: 'center',
          fontWeight: 600,
        }}
        >
          {mapInitError}
        </div>
      ) : null}
    </div>
  );
};

export default BookingMap;

