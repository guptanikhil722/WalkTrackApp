import { useState, useCallback } from 'react';
import { locationService } from '../services/location';
import { MapRegion } from '../types';

export const useLocationTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  const startTracking = useCallback(async () => {
    try {
      const hasPermission = await locationService.requestPermissions();
      if (!hasPermission) {
        setError('Location permission denied');
        return;
      }

      const id = locationService.watchPosition(
        () => {
          // Location update handled by HomeScreen
        },
        (error) => {
          setError(error.message);
          setIsTracking(false);
        }
      );

      setWatchId(id);
      setIsTracking(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start tracking');
      setIsTracking(false);
    }
  }, []);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      locationService.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    setError(null);
  }, [watchId]);

  return {
    isTracking,
    error,
    startTracking,
    stopTracking,
  };
}; 