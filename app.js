/**
 * Student Name: Sherren Jielita
 * Email: sherrenjielita@brandeis.edu
 * 
 * App Name: Summer Vibes - Ultimate Bucket List Tracker
 * 
 * This app helps users create, track, and document their summer adventures with:
 * - Multiple screens for different features
 * - Camera integration for capturing memories
 * - Location tracking for activities
 * - AsyncStorage for data persistence
 * - Progress tracking and statistics
 * - Photo gallery of completed activities
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import BucketListScreen from './screens/BucketListScreen';
import ActivityDetailsScreen from './screens/ActivityDetailsScreen';
import MemoriesScreen from './screens/MemoriesScreen';
import StatsScreen from './screens/StatsScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator for bucket list and activity details
function BucketListStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="BucketList" 
        component={BucketListScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ActivityDetails" 
        component={ActivityDetailsScreen}
        options={{ 
          title: 'Activity Details',
          headerStyle: {
            backgroundColor: '#FF6B35',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Memories') {
              iconName = focused ? 'camera' : 'camera-outline';
            } else if (route.name === 'Stats') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#FF6B35',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={BucketListStack} />
        <Tab.Screen name="Memories" component={MemoriesScreen} />
        <Tab.Screen name="Stats" component={StatsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}