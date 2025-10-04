import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NetInfo from '@react-native-community/netinfo';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ExpensesScreen from './src/screens/ExpensesScreen';
import InvoicesScreen from './src/screens/InvoicesScreen';
import BankingScreen from './src/screens/BankingScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ReceiptScannerScreen from './src/screens/ReceiptScannerScreen';
import TimeTrackingScreen from './src/screens/TimeTrackingScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';

// Import contexts
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import { ThemeProvider } from './src/contexts/ThemeContext';

// Import components
import LoadingSpinner from './src/components/LoadingSpinner';
import OfflineBanner from './src/components/OfflineBanner';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Expenses':
              iconName = 'receipt';
              break;
            case 'Invoices':
              iconName = 'description';
              break;
            case 'Banking':
              iconName = 'account-balance';
              break;
            case 'Reports':
              iconName = 'assessment';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
      <Tab.Screen name="Invoices" component={InvoicesScreen} />
      <Tab.Screen name="Banking" component={BankingScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Auth Stack Navigator
function AuthStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Main App Stack Navigator
function AppStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen 
        name="ReceiptScanner" 
        component={ReceiptScannerScreen}
        options={{
          headerShown: true,
          title: 'Scan Receipt',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen 
        name="TimeTracking" 
        component={TimeTrackingScreen}
        options={{
          headerShown: true,
          title: 'Time Tracking',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen 
        name="Inventory" 
        component={InventoryScreen}
        options={{
          headerShown: true,
          title: 'Inventory',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen 
        name="Projects" 
        component={ProjectsScreen}
        options={{
          headerShown: true,
          title: 'Projects',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
}

// Main App Component
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isNetworkConnected, setIsNetworkConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsNetworkConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      {!isNetworkConnected && <OfflineBanner />}
      {isAuthenticated ? <AppStackNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
}

// Root App Component
export default function App() {
  return (
    <ThemeProvider>
      <NetworkProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NetworkProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
