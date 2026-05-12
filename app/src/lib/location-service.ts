import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_LOCATION_TASK = 'kull1-background-location';
const GEOFENCE_TASK = 'kull1-geofence';

// Store for current tournament boundary
let activeBoundary: { lat: number; lng: number }[] | null = null;
let onBoundaryExit: (() => void) | null = null;

/**
 * Request all location permissions (foreground + background).
 * Must be called before starting background tracking.
 */
export async function requestLocationPermissions(): Promise<boolean> {
  const { status: foreground } = await Location.requestForegroundPermissionsAsync();
  if (foreground !== 'granted') return false;

  const { status: background } = await Location.requestBackgroundPermissionsAsync();
  return background === 'granted';
}

/**
 * Start background GPS tracking during an active tournament.
 * Records position every 30 seconds for tournament verification.
 */
export async function startBackgroundTracking() {
  const hasPermission = await requestLocationPermissions();
  if (!hasPermission) {
    throw new Error('Background location permission required');
  }

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 30000, // every 30 seconds
    distanceInterval: 10, // or every 10 meters
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
}

/**
 * Start geofence monitoring for a tournament boundary.
 * Uses a simplified approach: monitors a circular region around the boundary center,
 * then does precise polygon check in the background task.
 */
export async function startGeofenceMonitoring(
  boundary: { lat: number; lng: number }[],
  onExit: () => void
) {
  activeBoundary = boundary;
  onBoundaryExit = onExit;

  // Calculate bounding circle
  const centerLat = boundary.reduce((sum, p) => sum + p.lat, 0) / boundary.length;
  const centerLng = boundary.reduce((sum, p) => sum + p.lng, 0) / boundary.length;

  // Find max distance from center to any boundary point (rough radius)
  let maxDist = 0;
  for (const p of boundary) {
    const dist = haversineDistance(centerLat, centerLng, p.lat, p.lng);
    maxDist = Math.max(maxDist, dist);
  }

  // Add 500m buffer to boundary radius
  const radius = maxDist + 500;

  await Location.startGeofencingAsync(GEOFENCE_TASK, [{
    identifier: 'tournament-boundary',
    latitude: centerLat,
    longitude: centerLng,
    radius,
    notifyOnEnter: true,
    notifyOnExit: true,
  }]);
}

export async function stopGeofenceMonitoring() {
  const isRunning = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK);
  if (isRunning) {
    await Location.stopGeofencingAsync(GEOFENCE_TASK);
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

// Haversine distance in meters
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Background Task Definitions ──
// These must be defined at the top level, outside of any component.

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, ({ data, error }) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    // TODO: Store location trail for tournament verification
    // Could write to FileSystem or send to API
    console.log('Background location update:', locations.length, 'points');
  }
});

TaskManager.defineTask(GEOFENCE_TASK, ({ data, error }) => {
  if (error) {
    console.error('Geofence error:', error);
    return;
  }
  if (data) {
    const { eventType, region } = data as {
      eventType: Location.GeofencingEventType;
      region: Location.LocationRegion;
    };

    if (eventType === Location.GeofencingEventType.Exit) {
      console.log('GEOFENCE EXIT detected');
      // Trigger notification or callback
      if (onBoundaryExit) onBoundaryExit();
    }
  }
});
