import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Walk, Coordinate } from '../types';

interface WalkContextType {
  currentWalk: Walk | null;
  savedWalks: Walk[];
  isLoading: boolean;
  startWalk: () => void;
  updateWalk: (update: WalkUpdate) => void;
  endWalk: () => Promise<void>;
  deleteWalk: (walkId: string) => Promise<void>;
}

interface WalkUpdate {
  locations?: Coordinate[];
  distance?: number;
  duration?: string;
}

const WalkContext = createContext<WalkContextType | undefined>(undefined);

interface WalkProviderProps {
  children: React.ReactNode;
}

export const WalkProvider: React.FC<WalkProviderProps> = ({ children }) => {
  const [currentWalk, setCurrentWalk] = useState<Walk | null>(null);
  const [savedWalks, setSavedWalks] = useState<Walk[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadCurrentWalk();
    void loadSavedWalks();
  }, []);

  const loadCurrentWalk = async (): Promise<void> => {
    try {
      const savedWalk = await AsyncStorage.getItem('currentWalk');
      if (savedWalk) {
        const parsedWalk: Walk = JSON.parse(savedWalk);
        setCurrentWalk(parsedWalk);
      }
    } catch (error) {
      console.error('Error loading current walk:', error);
    }
  };

  const loadSavedWalks = async (): Promise<void> => {
    try {
      const walksJson = await AsyncStorage.getItem('completedWalks');
      if (walksJson) {
        const parsedWalks: Walk[] = JSON.parse(walksJson);
        setSavedWalks(parsedWalks);
      }
    } catch (error) {
      console.error('Error loading saved walks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startWalk = (): void => {
    const newWalk: Walk = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration: '00:00:00',
      distance: 0,
      locations: [],
    };
    setCurrentWalk(newWalk);
    void saveWalk(newWalk);
  };

  const updateWalk = (update: WalkUpdate): void => {
    if (!currentWalk) return;

    const updatedWalk: Walk = {
      ...currentWalk,
      locations: update.locations ?? currentWalk.locations,
      distance: update.distance ?? currentWalk.distance,
      duration: update.duration ?? currentWalk.duration,
    };

    setCurrentWalk(updatedWalk);
    void saveWalk(updatedWalk);
  };

  const endWalk = async (): Promise<void> => {
    if (!currentWalk) return;

    try {
      // Save to completed walks
      const updatedWalks: Walk[] = [currentWalk, ...savedWalks];
      await AsyncStorage.setItem('completedWalks', JSON.stringify(updatedWalks));
      setSavedWalks(updatedWalks);

      // Clear current walk
      await AsyncStorage.removeItem('currentWalk');
      setCurrentWalk(null);
    } catch (error) {
      console.error('Error ending walk:', error);
    }
  };

  const deleteWalk = async (walkId: string): Promise<void> => {
    try {
      const updatedWalks: Walk[] = savedWalks.filter((walk) => walk.id !== walkId);
      await AsyncStorage.setItem('completedWalks', JSON.stringify(updatedWalks));
      setSavedWalks(updatedWalks);
    } catch (error) {
      console.error('Error deleting walk:', error);
      throw error;
    }
  };

  const saveWalk = async (walk: Walk): Promise<void> => {
    try {
      await AsyncStorage.setItem('currentWalk', JSON.stringify(walk));
    } catch (error) {
      console.error('Error saving walk:', error);
    }
  };

  const value: WalkContextType = {
    currentWalk,
    savedWalks,
    isLoading,
    startWalk,
    updateWalk,
    endWalk,
    deleteWalk,
  };

  return <WalkContext.Provider value={value}>{children}</WalkContext.Provider>;
};

export const useWalk = (): WalkContextType => {
  const context = useContext(WalkContext);
  if (context === undefined) {
    throw new Error('useWalk must be used within a WalkProvider');
  }
  return context;
}; 