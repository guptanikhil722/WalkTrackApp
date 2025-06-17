import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { SavedWalksScreen } from '../screens/SavedWalksScreen';
// import NewMap from '../screens/NewMap';

export type RootStackParamList = {
  Home: undefined;
  SavedWalks: undefined;
  // NewMap: undefined
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        // screenOptions={{
        //   headerStyle: {
        //     backgroundColor: '#4CAF50',
        //   },
        //   headerTintColor: '#fff',
        //   headerTitleStyle: {
        //     fontWeight: 'bold',
        //   },
        // }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Walk Tracker',
            headerShown:false
          }}
        />
        <Stack.Screen
          name="SavedWalks"
          component={SavedWalksScreen}
          options={{
            title: 'Saved Walks',
            headerShown:false
          }}
        />
        {/* <Stack.Screen
          name="NewMap"
          component={NewMap}
          options={{
            title: 'Saved Walks',
            headerShown:false
          }}
        /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 