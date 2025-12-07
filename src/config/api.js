// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.8:3000/api';
export const API_TIMEOUT = 5000;

// Campus Location (default values)
export const EVSU_CENTER = {
  latitude: 11.2443,
  longitude: 125.0023,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

// Campus Boundaries
export const CAMPUS_BOUNDARIES = {
  northEast: { latitude: 11.2500, longitude: 125.0080 },
  southWest: { latitude: 11.2380, longitude: 124.9960 },
};

// Map Settings
export const MAP_ANIMATION_DURATION = 1000;
export const MAP_ZOOM_DELTA = 0.005;

