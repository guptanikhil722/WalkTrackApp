import { useState, useEffect } from 'react';
import { Coordinate, Walk } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WalkUpdate {
  locations?: Coordinate[];
  distance?: number;
  duration?: string;
}

export const useWalkTracking = () => {
  const [currentWalk, setCurrentWalk] = useState<Walk | null>(null);
  const [savedWalks, setSavedWalks] = useState<Walk[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentWalk();
    loadSavedWalks();
  }, []);

  const loadCurrentWalk = async () => {
    try {
      const savedWalk = await AsyncStorage.getItem('currentWalk');
      if (savedWalk) {
        setCurrentWalk(JSON.parse(savedWalk));
      }
    } catch (error) {
      console.error('Error loading current walk:', error);
    }
  };

  const loadSavedWalks = async () => {
    try {
      const walksJson = await AsyncStorage.getItem('completedWalks');
      if (walksJson) {
        setSavedWalks(JSON.parse(walksJson));
      }
    } catch (error) {
      console.error('Error loading saved walks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startWalk = () => {
    const newWalk: Walk = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration: '00:00:00',
      distance: 0,
      locations: [],
      coordinates: [],
      timestamp: '',
      startTime: '',
      endTime: ''
    };
    setCurrentWalk(newWalk);
    saveWalk(newWalk);
  };

  const updateWalk = (update: WalkUpdate) => {
    if (!currentWalk) return;

    const updatedWalk: Walk = {
      ...currentWalk,
      locations: update.locations || currentWalk.locations,
      distance: update.distance ?? currentWalk.distance,
      duration: update.duration || currentWalk.duration,
    };

    setCurrentWalk(updatedWalk);
    saveWalk(updatedWalk);
  };

  const endWalk = async () => {
    if (!currentWalk) return;

    try {
      // Save to completed walks
      const updatedWalks = [currentWalk, ...savedWalks];
      await AsyncStorage.setItem('completedWalks', JSON.stringify(updatedWalks));
      setSavedWalks(updatedWalks);

      // Clear current walk
      await AsyncStorage.removeItem('currentWalk');
      setCurrentWalk(null);
    } catch (error) {
      console.error('Error ending walk:', error);
    }
  };

  const deleteWalk = async (walkId: string) => {
    try {
      const updatedWalks = savedWalks.filter((walk) => walk.id !== walkId);
      await AsyncStorage.setItem('completedWalks', JSON.stringify(updatedWalks));
      setSavedWalks(updatedWalks);
    } catch (error) {
      console.error('Error deleting walk:', error);
      throw error;
    }
  };

  const saveWalk = async (walk: Walk) => {
    try {
      await AsyncStorage.setItem('currentWalk', JSON.stringify(walk));
    } catch (error) {
      console.error('Error saving walk:', error);
    }
  };

  return {
    currentWalk,
    savedWalks,
    isLoading,
    startWalk,
    updateWalk,
    endWalk,
    deleteWalk,
  };
};

// Helper function to calculate distance between points
// Helper function to calculate distance between points
const calculateDistance = (locations: Coordinate[]): number => {
  if (locations.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < locations.length; i++) {
    const prev = locations[i - 1];
    const curr = locations[i];
    totalDistance += getDistanceFromLatLonInMeters(
      prev.latitude,
      prev.longitude,
      curr.latitude,
      curr.longitude
    );
  }

  return totalDistance;
};
// Haversine formula to calculate distance between two points
const getDistanceFromLatLonInMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}; 