declare module '@react-native-community/geolocation' {
  export interface GeoPosition {
    coords: {
      latitude: number;
      longitude: number;
      altitude: number | null;
      accuracy: number;
      altitudeAccuracy: number | null;
      heading: number | null;
      speed: number | null;
      
    };
    timestamp: number;
  }

  export interface GeoError {
    code: number;
    message: string;
  }

  export interface GeoOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    distanceFilter?: number;
    interval?: number;
    fastestInterval?: number;
  }

  export interface GeoConfiguration {
    skipPermissionRequests?: boolean;
    authorizationLevel?: 'whenInUse' | 'always';
    locationProvider?: 'auto' | 'gps' | 'network' | 'passive';
  }

  const Geolocation: {
    getCurrentPosition(
      successCallback: (position: GeoPosition) => void,
      errorCallback: (error: GeoError) => void,
      options?: GeoOptions
    ): void;

    watchPosition(
      successCallback: (position: GeoPosition) => void,
      errorCallback: (error: GeoError) => void,
      options?: GeoOptions
    ): number;

    clearWatch(watchId: number): void;

    stopObserving(): void;

    setRNConfiguration(config: GeoConfiguration): void;
  };

  export default Geolocation;
} 