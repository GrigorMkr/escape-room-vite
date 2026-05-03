import {useEffect, useRef} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, PIN_ICON_ANCHOR, PIN_ICON_SIZE} from '../constants/ui';
import {resolvePublicAssetUrl} from '../utils/public-asset-url';

const ContactsMap = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const container = mapRef.current as unknown as {_leaflet_id?: unknown};
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    const map = L.map(mapRef.current).setView(MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const markerIcon = L.icon({
      iconUrl: resolvePublicAssetUrl('img/svg/pin-default.svg'),
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

