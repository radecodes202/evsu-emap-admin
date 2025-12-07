// Campus Location Configuration
// Note: This app now uses Supabase - no local API server required

// Legacy API configuration (for backward compatibility with unused features)
// These are not used for Supabase-integrated features (Buildings, etc.)
// Only kept for pages that haven't been migrated yet (Users, Paths, Chatbot)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const API_TIMEOUT = 5000;

// Campus Location (default values)
export const EVSU_CENTER = {
  latitude: 11.2443,
  longitude: 125.0023,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

// Campus Boundaries
// Expanded boundaries to support indoor mapping with high precision
// For indoor mapping, we need more precise coordinates
export const CAMPUS_BOUNDARIES = {
  northEast: { latitude: 11.2600, longitude: 125.0200 },
  southWest: { latitude: 11.2300, longitude: 124.9900 },
};

// Map Settings
export const MAP_ANIMATION_DURATION = 1000;
export const MAP_ZOOM_DELTA = 0.005;
