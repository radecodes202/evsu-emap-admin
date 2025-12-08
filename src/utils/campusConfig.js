import { EVSU_CENTER, CAMPUS_BOUNDARIES } from '../config/api';

export function loadCampusConfig() {
  try {
    const saved = localStorage.getItem('campusConfig');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        center: {
          latitude: parsed.centerLatitude ?? EVSU_CENTER.latitude,
          longitude: parsed.centerLongitude ?? EVSU_CENTER.longitude,
          latitudeDelta: parsed.latitudeDelta ?? EVSU_CENTER.latitudeDelta,
          longitudeDelta: parsed.longitudeDelta ?? EVSU_CENTER.longitudeDelta,
        },
        bounds: {
          northEast: {
            latitude: parsed.northEastLat ?? CAMPUS_BOUNDARIES.northEast.latitude,
            longitude: parsed.northEastLng ?? CAMPUS_BOUNDARIES.northEast.longitude,
          },
          southWest: {
            latitude: parsed.southWestLat ?? CAMPUS_BOUNDARIES.southWest.latitude,
            longitude: parsed.southWestLng ?? CAMPUS_BOUNDARIES.southWest.longitude,
          },
        },
      };
    }
  } catch (e) {
    console.warn('Failed to parse campusConfig, using defaults', e);
  }
  return {
    center: EVSU_CENTER,
    bounds: CAMPUS_BOUNDARIES,
  };
}

