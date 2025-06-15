import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation, { GeoPosition, GeoError } from '@react-native-community/geolocation';
import { Coordinate } from '../types';

export const locationService = {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      Geolocation.setRNConfiguration({
        skipPermissionRequests: false,
        authorizationLevel: 'whenInUse',
      });
      return true;
    }

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to track your walks.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return false;
  },

  getCurrentPosition(): Promise<Coordinate> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position: GeoPosition) => {
          console.log(position)
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.0421,
            longitudeDelta: 0.0421
          });
        },
        (error: GeoError) => {
          reject(error);
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 10000
        }
      );
    });
  },

  watchPosition(
    onPosition: (coordinate: Coordinate) => void,
    onError: (error: GeoError) => void
  ): number {
    return Geolocation.watchPosition(
      (position: GeoPosition) => {
        onPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      onError,
      {
        enableHighAccuracy: true,
        distanceFilter: 5, // minimum distance (meters) between updates
        interval: 5000, // minimum time (milliseconds) between updates
        fastestInterval: 2000, // fastest rate in milliseconds at which your app can handle updates
      }
    );
  },

  clearWatch(watchId: number): void {
    Geolocation.clearWatch(watchId);
  },
}; 