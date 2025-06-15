import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Coordinate } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface WalkMapProps {
  currentLocation: Region | null;
  routeCoordinates: Coordinate[];
  mapRef?: React.RefObject<MapView>;
  onMapReady?: () => void;
  showsUserLocation?: boolean;
  followsUserLocation?: boolean;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
}

export const WalkMap: React.FC<WalkMapProps> = ({
  currentLocation,
  routeCoordinates,
  mapRef,
  onMapReady,
  showsUserLocation = true,
  followsUserLocation = true,
  scrollEnabled = true,
  zoomEnabled = true,
}) => {
  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={false}
      followsUserLocation={followsUserLocation}
      initialRegion={currentLocation || undefined}
      onMapReady={onMapReady}
      scrollEnabled={scrollEnabled}
      zoomEnabled={zoomEnabled}
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
        <>
          <Marker
            coordinate={{
              latitude: routeCoordinates[0].latitude,
              longitude: routeCoordinates[0].longitude,
            }}
            title="Start"
          >
            <View style={styles.markerContainer}>
              <Icon name="flag" size={24} color="#4CAF50" />
            </View>
          </Marker>
          <Marker
            coordinate={{
              latitude: routeCoordinates[routeCoordinates.length - 1].latitude,
              longitude: routeCoordinates[routeCoordinates.length - 1].longitude,
            }}
            title="End"
          >
            <View style={styles.markerContainer}>
              <Icon name="flag" size={24} color="#f44336" />
            </View>
          </Marker>
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#2196F3"
            strokeWidth={3}
          />
        </>
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
}); 