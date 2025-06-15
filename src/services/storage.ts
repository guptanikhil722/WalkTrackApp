import AsyncStorage from '@react-native-async-storage/async-storage';
import { Walk } from '../types';

const STORAGE_KEY = '@walk_tracker_walks';

export const storageService = {
  async saveWalks(walks: Walk[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(walks));
    } catch (error) {
      console.error('Error saving walks:', error);
      throw error;
    }
  },

  async loadWalks(): Promise<Walk[]> {
    try {
      const walks = await AsyncStorage.getItem(STORAGE_KEY);
      return walks ? JSON.parse(walks) : [];
    } catch (error) {
      console.error('Error loading walks:', error);
      return [];
    }
  },
}; 