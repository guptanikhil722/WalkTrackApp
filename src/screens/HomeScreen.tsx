import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
  Text,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline, Region } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { locationService } from '../services/location';
import { Coordinate, RootStackParamList } from '../types';
import { useNavigation, useIsFocused, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTimer } from '../hooks/useTimer';
import { useWalkTracking } from '../hooks/useWalkTracking';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
const INITIAL_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};
export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [currentLocation, setCurrentLocation] = useState<Region | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const mapRef = useRef<MapView>(null);
  const watchIdRef = useRef<number | null>(null);
  const { formattedTime, resetTimer } = useTimer(isTracking);
  const { currentWalk, startWalk, updateWalk, endWalk } = useWalkTracking();
  const isFocused = useIsFocused()
  const [mapReady, setMapReady] = useState(false)
  const [region, setRegion] = useState(INITIAL_REGION);
  const settingUserLocation = async () => {
    try {
      const position = await locationService.getCurrentPosition();
      const region: Region = {
        latitude: position.latitude,
        longitude: position.longitude,
        latitudeDelta: position.latitudeDelta || 0.0421,
        longitudeDelta: position.longitudeDelta || 0.0421,
      };
      setCurrentLocation(region);
      mapRef.current?.animateToRegion(region, 1000);
      console.log('executed inside is focude,' , currentLocation, region)
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your location. Please make sure location services are enabled.',
        [
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };
    const moveToLocation = (coords: { latitude: number; longitude: number, latitudeDelta:number,longitudeDelta:number  }) => {
      console.log('coords>>', coords)
    setRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: coords.latitudeDelta *1.1 || 0.0421,
        longitudeDelta: coords.longitudeDelta *1.1|| 0.0421,
    });
  };
    useFocusEffect(
    useCallback(() => {
      let isActive = true;
      locationService.getCurrentPosition()
        .then(coords => {
          setCurrentLocation(coords);
          console.log(coords,'inside usefocus')
          if (isActive) moveToLocation(coords);
        })
        .catch(error => {
          Alert.alert("Location Error", error.message);
        });
      return () => { isActive = false; };
    }, [])
  );
  
  useEffect(() => {
    settingUserLocation();
    return () => {
      if (watchIdRef.current !== null) {
        locationService.clearWatch(watchIdRef.current);
      }
    };
  }, []);
  
  const toggleTracking = async () => {
    if (!isTracking) {
      // Start tracking
      const hasPermission = await locationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Location permission is required to track your walks.',
          [
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
        return;
      }

      // Start walk tracking
      startWalk();
      setRouteCoordinates([]);
      watchIdRef.current = locationService.watchPosition(
        (coordinate) => {
          const region: Region = {
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            latitudeDelta: coordinate.latitudeDelta || 0.0421,
            longitudeDelta: coordinate.longitudeDelta || 0.0421,
          };
          setCurrentLocation(region);
          setRouteCoordinates((prev) => [...prev, coordinate]);
          updateWalk({
            locations: [...routeCoordinates, coordinate],
            distance: calculateDistance([...routeCoordinates, coordinate]),
            duration: formattedTime,
          });
        },
        (error) => {
          console.error('Location tracking error:', error);
          Alert.alert('Error', 'Failed to track location. Please try again.');
          setIsTracking(false);
          endWalk();
          resetTimer();
        }
      );
    } else {
      // Stop tracking
      if (watchIdRef.current !== null) {
        locationService.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      endWalk();
      resetTimer();
    }
    setIsTracking(!isTracking);
  };

  const calculateDistance = (coordinates: Coordinate[]): number => {
    if (coordinates.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < coordinates.length; i++) {
      const prev = coordinates[i - 1];
      const curr = coordinates[i];
      totalDistance += getDistanceFromLatLonInKm(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
    }
    return totalDistance;
  };

  const getDistanceFromLatLonInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };
 console.log(region, 'refdd')
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        showsMyLocationButton={false}
        followsUserLocation
        initialRegion={currentLocation || undefined}
        region={region}
        onMapReady={()=>setMapReady(true)}
      >
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="You are here"
          >
            <View style={styles.markerContainer}>
              <Icon name="my-location" size={24} color="#2196F3" />
            </View>
          </Marker>
        )}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#2196F3"
            strokeWidth={3}
          />
        )}
      </MapView>

      <View style={styles.controls}>
        <Text style={styles.timer}>{formattedTime}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.centerButton]}
            onPress={settingUserLocation}
          >
            <Icon name="my-location" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isTracking ? styles.stopButton : styles.startButton]}
            onPress={toggleTracking}
          >
            <Icon
              name={isTracking ? 'stop' : 'play-arrow'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.historyButton]}
            onPress={() => navigation.navigate('SavedWalks')}
          >
            <Icon name="history" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  centerButton: {
    backgroundColor: '#2196F3',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  historyButton: {
    backgroundColor: '#FF9800',
  },
  markerContainer: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
}); 