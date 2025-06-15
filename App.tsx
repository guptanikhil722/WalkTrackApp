/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { WalkProvider } from './src/services/WalkContext';
import { locationService } from './src/services/location';
import { Alert } from 'react-native';

const App = () => {
  useEffect(() => {
    const requestLocationPermission = async () => {
      const hasPermission = await locationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'This app needs access to your location to track your walks. Please enable location services in your device settings.',
          [{ text: 'OK' }]
        );
      }
    };

    requestLocationPermission();
  }, []);

  return (
    <SafeAreaProvider>
      <WalkProvider>
        <AppNavigator />
      </WalkProvider>
    </SafeAreaProvider>
  );
};

export default App;
