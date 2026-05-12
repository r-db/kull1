import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_LOCATION_TASK = 'kull1-background-location';

// Store for current tournament boundary (polygon, not circle)
let activeBoundary: [number, number][] | null = null; // [lng, lat] GeoJSON order
let onBoundaryExit: (() => void) | null = null;
let wasInsideBoundary = true;

/**
 * Request all location permissions (foreground + background).
 */
export async function requestLocationPermissions(): Promise<boolean> {
  const { status: foreground } = await Location.requestForegroundPermissionsAsync();
  if (foreground !== 'granted') return false;

  const { status: background } = await Location.requestBackgroundPermissionsAsync();
  return background === 'granted';
}

/**
 * Point-in-polygon using ray casting. Same algorithm as server.
 * Polygon coords in GeoJSON order: [lng, lat]
 */
function pointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]; // [lng, lat]
    const [xj, yj] = polygon[j];
    const intersect = ((yi > lat) !== (yj > lat))
      && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Start background GPS tracking during an active tournament.
 * Checks position against polygon boundary on every update.
 * expo-location geofencing only supports circles — we do our own polygon check.
 */
export async function startBackgroundTracking(
  boundary?: [number, number][],
  onExit?: () => void
) {
  const hasPermission = await requestLocationPermissions();
  if (!hasPermission) {
    throw new Error('Background location permission required');
  }

  if (boundary) {
    activeBoundary = boundary;
    onBoundaryExit = onExit || null;
    wasInsideBoundary = true;
  }

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 30000,
    distanceInterval: 10,
    foregroundService: {
      notificationTitle: 'KULL 1 — Tournament Active',
      notificationBody: 'GPS tracking is running for tournament verification.',
      notificationColor: '#4ADE80',
    },
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
  });
}

/**
 * Stop background GPS tracking.
 */
export async function stopBackgroundTracking() {
  const isRunning = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  if (isRunning) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
  activeBoundary = null;
  onBoundaryExit = null;
}

/**
 * Get current high-accuracy position.
 */
export async function getCurrentPosition(): Promise<Location.LocationObject> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission required');
  }
  return Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.BestForNavigation,
  });
}

/**
 * Check if a point is inside the active boundary.
 */
export function isInsideBoundary(lat: number, lng: number): boolean {
  if (!activeBoundary) return true; // No boundary = always valid
  return pointInPolygon(lat, lng, activeBoundary);
}

// ── Background Task Definition ──
// Runs polygon boundary check on every location update.

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };

    // Check each location against boundary polygon
    if (activeBoundary && locations.length > 0) {
      const latest = locations[locations.length - 1];
      const inside = pointInPolygon(
        latest.coords.latitude,
        latest.coords.longitude,
        activeBoundary
      );

      if (wasInsideBoundary && !inside) {
        // Just exited boundary
        console.log('BOUNDARY EXIT detected at', latest.coords.latitude, latest.coords.longitude);
        if (onBoundaryExit) onBoundaryExit();
      }
      wasInsideBoundary = inside;
    }
  }
});
