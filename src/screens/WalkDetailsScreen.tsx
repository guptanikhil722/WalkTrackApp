import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Walk } from '../types';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

type WalkDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WalkDetails'>;
type WalkDetailsScreenRouteProp = RouteProp<RootStackParamList, 'WalkDetails'>;

export const WalkDetailsScreen = () => {
  const navigation = useNavigation<WalkDetailsScreenNavigationProp>();
  const route = useRoute<WalkDetailsScreenRouteProp>();
  const [walk, setWalk] = useState<Walk | null>(null);

  useEffect(() => {
    loadWalk();
  }, []);

  const loadWalk = async () => {
    try {
      const walksJson = await AsyncStorage.getItem('completedWalks');
      if (walksJson) {
        const walks: Walk[] = JSON.parse(walksJson);
        const foundWalk = walks.find((w) => w.id === route.params.walkId);
        if (foundWalk) {
          setWalk(foundWalk);
        } else {
          Alert.alert('Error', 'Walk not found');
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error('Error loading walk:', error);
      Alert.alert('Error', 'Failed to load walk details');
      navigation.goBack();
    }
  };

  if (!walk) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const initialRegion = walk.locations[0]
    ? {
        latitude: walk.locations[0].latitude,
        longitude: walk.locations[0].longitude,
        latitudeDelta: 0.0421,
        longitudeDelta: 0.0421,
      }
    : undefined;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        scrollEnabled={true}
        zoomEnabled={true}
      >
        {walk.locations.length > 0 && (
          <>
            <Marker
              coordinate={{
                latitude: walk.locations[0].latitude,
                longitude: walk.locations[0].longitude,
              }}
              title="Start"
            >
              <View style={styles.markerContainer}>
                <Icon name="flag" size={24} color="#4CAF50" />
              </View>
            </Marker>
            <Marker
              coordinate={{
                latitude: walk.locations[walk.locations.length - 1].latitude,
                longitude: walk.locations[walk.locations.length - 1].longitude,
              }}
              title="End"
            >
              <View style={styles.markerContainer}>
                <Icon name="flag" size={24} color="#f44336" />
              </View>
            </Marker>
            <Polyline
              coordinates={walk.locations}
              strokeColor="#2196F3"
              strokeWidth={3}
            />
          </>
        )}
      </MapView>

      <ScrollView style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Icon name="schedule" size={24} color="#2196F3" />
          <Text style={styles.detailText}>Duration: {walk.duration}</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="straighten" size={24} color="#2196F3" />
          <Text style={styles.detailText}>
            Distance: {walk.distance.toFixed(2)} km
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="event" size={24} color="#2196F3" />
          <Text style={styles.detailText}>
            Date: {new Date(walk.date).toLocaleString()}
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    height: '50%',
  },
  detailsContainer: {
    flex: 1,
    padding: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
  detailText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
  },
  markerContainer: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
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
}); 