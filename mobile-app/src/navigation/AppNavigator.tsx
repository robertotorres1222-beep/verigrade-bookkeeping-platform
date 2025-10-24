import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import MileageTrackingScreen from '../screens/MileageTrackingScreen';
import ReceiptCaptureScreen from '../screens/ReceiptCaptureScreen';
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';
import VoiceNotesScreen from '../screens/VoiceNotesScreen';
import TimeTrackingScreen from '../screens/TimeTrackingScreen';
import DocumentManagementScreen from '../screens/DocumentManagementScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main tab navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Mileage') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Receipts') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Scanner') {
            iconName = focused ? 'scan' : 'scan-outline';
          } else if (route.name === 'Voice') {
            iconName = focused ? 'mic' : 'mic-outline';
          } else if (route.name === 'Time') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Documents') {
            iconName = focused ? 'document' : 'document-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Mileage" 
        component={MileageTrackingScreen}
        options={{ title: 'Mileage' }}
      />
      <Tab.Screen 
        name="Receipts" 
        component={ReceiptCaptureScreen}
        options={{ title: 'Receipts' }}
      />
      <Tab.Screen 
        name="Scanner" 
        component={BarcodeScannerScreen}
        options={{ title: 'Scanner' }}
      />
      <Tab.Screen 
        name="Voice" 
        component={VoiceNotesScreen}
        options={{ title: 'Voice Notes' }}
      />
      <Tab.Screen 
        name="Time" 
        component={TimeTrackingScreen}
        options={{ title: 'Time Tracking' }}
      />
      <Tab.Screen 
        name="Documents" 
        component={DocumentManagementScreen}
        options={{ title: 'Documents' }}
      />
    </Tab.Navigator>
  );
}

// Root stack navigator
function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;

