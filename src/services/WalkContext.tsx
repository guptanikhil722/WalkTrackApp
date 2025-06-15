import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Walk } from '../types';

interface WalkState {
  isWalking: boolean;
  currentWalk: Walk | null;
  savedWalks: Walk[];
}
import { storageService } from './storage';
import { locationService } from './location';
import { GeoError } from '@react-native-community/geolocation';

interface WalkContextType extends WalkState {
  startWalk: () => void;
  stopWalk: () => void;
}

const WalkContext = createContext<WalkContextType | undefined>(undefined);

export const WalkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WalkState>({
    isWalking: false,
    currentWalk: null,
    savedWalks: [],
  });

  // Load saved walks on mount
  useEffect(() => {
    const loadWalks = async () => {
      const walks = await storageService.loadWalks();
      setState(prev => ({ ...prev, savedWalks: walks }));
    };
    loadWalks();
  }, []);

  const startWalk = useCallback(async () => {
    const hasPermission = await locationService.requestPermissions();
    if (!hasPermission) {
      console.error('Location permission not granted');
      return;
    }

    const newWalk: Walk = {
      id: Date.now().toString(),
      coordinates: [],
      timestamp: Date.now().toString(),
      startTime: '',
      endTime: '',
      locations: [],
      distance: 0,
      date: '',
      duration: ''
    };

    setState(prev => ({
      ...prev,
      isWalking: true,
      currentWalk: newWalk,
    }));
  }, []);

  const stopWalk = useCallback(async () => {
    setState(prev => {
      if (!prev.currentWalk) return prev;

      const updatedWalks = [...prev.savedWalks, prev.currentWalk];
      storageService.saveWalks(updatedWalks);

      return {
        isWalking: false,
        currentWalk: null,
        savedWalks: updatedWalks,
      };
    });
  }, []);

  // Watch position when walking
  useEffect(() => {
    let watchId: number | undefined;

    if (state.isWalking) {
      watchId = locationService.watchPosition(
        (coordinate) => {
          setState((prev:any) => {
            if (!prev.isWalking || !prev.currentWalk) return prev;

            return {
              ...prev,
              currentWalk: {
                ...prev.currentWalk,
                coordinates: [...prev.currentWalk.coordinates, coordinate],
                duration: Math.floor((Date.now() - prev.currentWalk.timestamp) / 1000),
              },
            };
          });
        },
        (error: GeoError) => {
          console.error('Error watching position:', error);
        }
      );
    }

    return () => {
      if (watchId !== undefined) {
        locationService.clearWatch(watchId);
      }
    };
  }, [state.isWalking]);

  return (
    <WalkContext.Provider
      value={{
        ...state,
        startWalk,
        stopWalk,
      }}
    >
      {children}
    </WalkContext.Provider>
  );
};

export const useWalk = () => {
  const context = useContext(WalkContext);
  if (context === undefined) {
    throw new Error('useWalk must be used within a WalkProvider');
  }
  return context;
}; 