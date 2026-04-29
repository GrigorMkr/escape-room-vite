import {useEffect, useRef} from 'react';
import L from 'leaflet';
import {MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, PIN_ICON_ANCHOR, PIN_ICON_SIZE} from '../constants/ui';

const ContactsMap = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    // React.StrictMode mounts effects twice in dev.
    // Leaflet throws "Map container is already initialized" if the DOM node still has _leaflet_id.
    const container = mapRef.current as unknown as {_leaflet_id?: unknown};
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    const map = L.map(mapRef.current).setView(MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM);

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    });
    osm.addTo(map);

    // Fallback: if tiles are blocked/unavailable, try 2GIS.
    let tileErrors = 0;
    const onTileError = () => {
      tileErrors += 1;
      if (tileErrors >= 8) {
        map.removeLayer(osm);
        L.tileLayer('http://tile2.maps.2gis.com/tiles?x={x}&y={y}&z={z}', {
          attribution: '&copy; 2GIS',
        }).addTo(map);
        osm.off('tileerror', onTileError);
      }
    };
    osm.on('tileerror', onTileError);

    const markerIcon = L.icon({
      iconUrl: '/img/svg/pin-default.svg',
      iconSize: PIN_ICON_SIZE,
      iconAnchor: PIN_ICON_ANCHOR,
    });

    L.marker(MAP_DEFAULT_CENTER, {icon: markerIcon}).addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  return <div className="map__container" ref={mapRef} />;
};

export default ContactsMap;

