import { NativeStackScreenProps } from '@react-navigation/native-stack';

export interface Coordinate {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface Walk {
  id: string;
  date: string;
  duration: string;
  distance: number;
  locations: Coordinate[];
  coordinates: Coordinate[];
  timestamp: string;
  startTime: string
  endTime: string
}

export type RootStackParamList = {
  Home: undefined;
  SavedWalks: undefined;
  WalkDetails: { walkId: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>; 