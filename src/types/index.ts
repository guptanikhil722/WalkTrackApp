export interface Coordinate {
  latitude: number;
  longitude: number;
  latitudeDelta: number | null;
  longitudeDelta: number | null;
}

export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface Walk {
  coordinates: any;
  id: string;
  startTime: string;
  endTime: string | null;
  locations: Location[];
  distance: number;
  timestamp: number;
}

export interface WalkState {
  isWalking: boolean;
  currentWalk: Walk | null;
  savedWalks: Walk[];
}

export interface WalkStats {
  totalWalks: number;
  totalDistance: number;
  totalTime: number;
  averageDistance: number;
  averageTime: number;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} 