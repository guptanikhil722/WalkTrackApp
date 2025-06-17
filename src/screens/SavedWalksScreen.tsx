import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Walk } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useWalkTracking } from '../hooks/useWalkTracking';

type SavedWalksScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SavedWalks'>;

export const SavedWalksScreen = () => {
  const navigation = useNavigation<SavedWalksScreenNavigationProp>();
  const { savedWalks, isLoading, deleteWalk } = useWalkTracking();

  const handleDeleteWalk = async (walkId: string) => {
    Alert.alert(
      'Delete Walk',
      'Are you sure you want to delete this walk?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWalk(walkId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete walk. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderWalkItem = ({ item }: { item: Walk }) => (
    <TouchableOpacity
      style={styles.walkItem}
      onPress={() => navigation.navigate('WalkDetails', { walkId: item.id })}
    >
      <View style={styles.walkInfo}>
        <Text style={styles.date}>{formatDate(item.date)}</Text>
        <Text style={styles.details}>
          Distance: {item.distance.toFixed(2)} km | Duration: {item.duration}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteWalk(item.id)}
      >
        <Icon name="delete" size={24} color="#f44336" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Walks</Text>
        <View style={styles.headerRight} />
      </View>

      {savedWalks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="directions-walk" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No saved walks yet</Text>
        </View>
      ) : (
        <FlatList
          data={savedWalks}
          renderItem={renderWalkItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 24, // To balance the back button
  },
  backButton: {
    padding: 8,
  },
  list: {
    padding: 16,
  },
  walkItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  walkInfo: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
}); 