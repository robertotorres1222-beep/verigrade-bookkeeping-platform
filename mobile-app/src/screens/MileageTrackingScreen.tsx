import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Trip {
  id: string;
  startTime: Date;
  endTime?: Date;
  startLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  endLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  distance: number; // in miles
  purpose: string;
  businessPurpose: string;
  isBusinessTrip: boolean;
  status: 'active' | 'completed' | 'paused';
  route: Array<{
    latitude: number;
    longitude: number;
    timestamp: Date;
  }>;
}

interface MileageReport {
  id: string;
  month: string;
  year: number;
  totalMiles: number;
  businessMiles: number;
  personalMiles: number;
  irsRate: number;
  deduction: number;
  trips: Trip[];
}

export default function MileageTrackingScreen() {
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showTripModal, setShowTripModal] = useState(false);
  const [tripForm, setTripForm] = useState({
    purpose: '',
    businessPurpose: '',
    isBusinessTrip: true,
  });
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [reports, setReports] = useState<MileageReport[]>([]);
  const [totalMiles, setTotalMiles] = useState(0);
  const [businessMiles, setBusinessMiles] = useState(0);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    requestLocationPermission();
    loadTrips();
    loadReports();
  }, []);

  useEffect(() => {
    if (isTracking && hasLocationPermission) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
  }, [isTracking, hasLocationPermission]);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to location to track mileage.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        setHasLocationPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setHasLocationPermission(status === 'granted');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setHasLocationPermission(false);
    }
  };

  const startLocationTracking = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (newLocation) => {
          setCurrentLocation(newLocation);
          updateTripDistance(newLocation);
        }
      );
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Error', 'Failed to start location tracking');
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  const updateTripDistance = (location: Location.LocationObject) => {
    if (currentTrip && currentTrip.route.length > 0) {
      const lastPoint = currentTrip.route[currentTrip.route.length - 1];
      const distance = calculateDistance(
        lastPoint.latitude,
        lastPoint.longitude,
        location.coords.latitude,
        location.coords.longitude
      );

      const updatedTrip = {
        ...currentTrip,
        distance: currentTrip.distance + distance,
        route: [...currentTrip.route, {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date(),
        }],
      };

      setCurrentTrip(updatedTrip);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const startTrip = () => {
    if (!currentLocation) {
      Alert.alert('Error', 'Unable to get current location');
      return;
    }

    const newTrip: Trip = {
      id: `trip_${Date.now()}`,
      startTime: new Date(),
      startLocation: {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: 'Current Location', // In real app, you'd reverse geocode this
      },
      distance: 0,
      purpose: '',
      businessPurpose: '',
      isBusinessTrip: true,
      status: 'active',
      route: [{
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        timestamp: new Date(),
      }],
    };

    setCurrentTrip(newTrip);
    setIsTracking(true);
    setShowTripModal(true);
  };

  const pauseTrip = () => {
    if (currentTrip) {
      setCurrentTrip({ ...currentTrip, status: 'paused' });
      setIsTracking(false);
    }
  };

  const resumeTrip = () => {
    if (currentTrip) {
      setCurrentTrip({ ...currentTrip, status: 'active' });
      setIsTracking(true);
    }
  };

  const endTrip = () => {
    if (!currentTrip) return;

    const completedTrip: Trip = {
      ...currentTrip,
      endTime: new Date(),
      endLocation: currentLocation ? {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: 'End Location',
      } : undefined,
      status: 'completed',
    };

    setTrips(prev => [completedTrip, ...prev]);
    setCurrentTrip(null);
    setIsTracking(false);
    setShowTripModal(false);
    
    Alert.alert(
      'Trip Completed',
      `Distance: ${completedTrip.distance.toFixed(2)} miles\nDuration: ${getTripDuration(completedTrip)}`,
      [{ text: 'OK' }]
    );
  };

  const getTripDuration = (trip: Trip): string => {
    const start = trip.startTime;
    const end = trip.endTime || new Date();
    const duration = end.getTime() - start.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const saveTripDetails = () => {
    if (!currentTrip) return;

    const updatedTrip = {
      ...currentTrip,
      purpose: tripForm.purpose,
      businessPurpose: tripForm.businessPurpose,
      isBusinessTrip: tripForm.isBusinessTrip,
    };

    setCurrentTrip(updatedTrip);
    setShowTripModal(false);
  };

  const loadTrips = async () => {
    // In a real app, this would load from your backend
    const mockTrips: Trip[] = [
      {
        id: 'trip_1',
        startTime: new Date('2023-12-01T09:00:00'),
        endTime: new Date('2023-12-01T10:30:00'),
        startLocation: { latitude: 40.7128, longitude: -74.0060, address: 'New York, NY' },
        endLocation: { latitude: 40.7589, longitude: -73.9851, address: 'Central Park, NY' },
        distance: 5.2,
        purpose: 'Client Meeting',
        businessPurpose: 'Meeting with ABC Corp',
        isBusinessTrip: true,
        status: 'completed',
        route: [],
      },
    ];

    setTrips(mockTrips);
    
    const total = mockTrips.reduce((sum, trip) => sum + trip.distance, 0);
    const business = mockTrips
      .filter(trip => trip.isBusinessTrip)
      .reduce((sum, trip) => sum + trip.distance, 0);
    
    setTotalMiles(total);
    setBusinessMiles(business);
  };

  const loadReports = async () => {
    // In a real app, this would load from your backend
    const mockReports: MileageReport[] = [
      {
        id: 'report_1',
        month: 'December',
        year: 2023,
        totalMiles: 150.5,
        businessMiles: 120.3,
        personalMiles: 30.2,
        irsRate: 0.655,
        deduction: 78.8,
        trips: [],
      },
    ];

    setReports(mockReports);
  };

  const generateMonthlyReport = () => {
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });
    const currentYear = new Date().getFullYear();
    
    const monthlyTrips = trips.filter(trip => 
      trip.startTime.getMonth() === new Date().getMonth() &&
      trip.startTime.getFullYear() === currentYear
    );

    const totalMiles = monthlyTrips.reduce((sum, trip) => sum + trip.distance, 0);
    const businessMiles = monthlyTrips
      .filter(trip => trip.isBusinessTrip)
      .reduce((sum, trip) => sum + trip.distance, 0);
    const personalMiles = totalMiles - businessMiles;
    const irsRate = 0.655; // 2023 IRS rate
    const deduction = businessMiles * irsRate;

    const report: MileageReport = {
      id: `report_${Date.now()}`,
      month: currentMonth,
      year: currentYear,
      totalMiles,
      businessMiles,
      personalMiles,
      irsRate,
      deduction,
      trips: monthlyTrips,
    };

    setReports(prev => [report, ...prev]);
    setShowReportsModal(true);
  };

  const formatDistance = (miles: number): string => {
    return `${miles.toFixed(2)} mi`;
  };

  const formatDuration = (start: Date, end?: Date): string => {
    const endTime = end || new Date();
    const duration = endTime.getTime() - start.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (hasLocationPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting location permission...</Text>
      </View>
    );
  }

  if (hasLocationPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="location-off" size={64} color="#666" />
        <Text style={styles.permissionText}>Location permission is required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestLocationPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Current Trip Status */}
        {currentTrip && (
          <View style={styles.currentTripCard}>
            <View style={styles.currentTripHeader}>
              <Text style={styles.currentTripTitle}>Current Trip</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {currentTrip.status === 'active' ? 'Active' : 'Paused'}
                </Text>
              </View>
            </View>
            
            <View style={styles.tripStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDistance(currentTrip.distance)}</Text>
                <Text style={styles.statLabel}>Distance</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatDuration(currentTrip.startTime)}
                </Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {currentTrip.isBusinessTrip ? 'Business' : 'Personal'}
                </Text>
                <Text style={styles.statLabel}>Type</Text>
              </View>
            </View>

            <View style={styles.tripActions}>
              {currentTrip.status === 'active' ? (
                <TouchableOpacity style={styles.pauseButton} onPress={pauseTrip}>
                  <Ionicons name="pause" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Pause</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.resumeButton} onPress={resumeTrip}>
                  <Ionicons name="play" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Resume</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.endButton} onPress={endTrip}>
                <Ionicons name="stop" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>End Trip</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Trip Controls */}
        {!currentTrip && (
          <View style={styles.controlsCard}>
            <Text style={styles.controlsTitle}>Start New Trip</Text>
            <Text style={styles.controlsDescription}>
              Track your mileage for business or personal trips
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={startTrip}>
              <Ionicons name="play" size={24} color="#fff" />
              <Text style={styles.startButtonText}>Start Trip</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Summary Stats */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>This Month</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatDistance(totalMiles)}</Text>
              <Text style={styles.summaryLabel}>Total Miles</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatDistance(businessMiles)}</Text>
              <Text style={styles.summaryLabel}>Business Miles</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                ${(businessMiles * 0.655).toFixed(2)}
              </Text>
              <Text style={styles.summaryLabel}>Deduction</Text>
            </View>
          </View>
        </View>

        {/* Recent Trips */}
        <View style={styles.tripsCard}>
          <View style={styles.tripsHeader}>
            <Text style={styles.tripsTitle}>Recent Trips</Text>
            <TouchableOpacity onPress={generateMonthlyReport}>
              <Text style={styles.reportButtonText}>Generate Report</Text>
            </TouchableOpacity>
          </View>
          
          {trips.length === 0 ? (
            <Text style={styles.noTripsText}>No trips recorded yet</Text>
          ) : (
            trips.slice(0, 5).map((trip) => (
              <View key={trip.id} style={styles.tripItem}>
                <View style={styles.tripInfo}>
                  <Text style={styles.tripPurpose}>
                    {trip.purpose || 'Untitled Trip'}
                  </Text>
                  <Text style={styles.tripDetails}>
                    {formatDistance(trip.distance)} • {formatDuration(trip.startTime, trip.endTime)}
                  </Text>
                  <Text style={styles.tripDate}>
                    {trip.startTime.toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.tripBadge}>
                  <Text style={styles.tripBadgeText}>
                    {trip.isBusinessTrip ? 'Business' : 'Personal'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Trip Details Modal */}
      <Modal
        visible={showTripModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTripModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Trip Details</Text>
            <TouchableOpacity onPress={saveTripDetails}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Purpose</Text>
                <TextInput
                  style={styles.input}
                  value={tripForm.purpose}
                  onChangeText={(text) => setTripForm({ ...tripForm, purpose: text })}
                  placeholder="e.g., Client meeting, Office supplies"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Business Purpose</Text>
                <TextInput
                  style={styles.input}
                  value={tripForm.businessPurpose}
                  onChangeText={(text) => setTripForm({ ...tripForm, businessPurpose: text })}
                  placeholder="Detailed business purpose"
                />
              </View>

              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>Business Trip</Text>
                <TouchableOpacity
                  style={[
                    styles.toggle,
                    tripForm.isBusinessTrip && styles.toggleActive
                  ]}
                  onPress={() => setTripForm({ ...tripForm, isBusinessTrip: !tripForm.isBusinessTrip })}
                >
                  <View style={[
                    styles.toggleThumb,
                    tripForm.isBusinessTrip && styles.toggleThumbActive
                  ]} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Reports Modal */}
      <Modal
        visible={showReportsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowReportsModal(false)}>
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Mileage Reports</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {reports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <Text style={styles.reportTitle}>{report.month} {report.year}</Text>
                <View style={styles.reportStats}>
                  <View style={styles.reportStat}>
                    <Text style={styles.reportStatValue}>{formatDistance(report.totalMiles)}</Text>
                    <Text style={styles.reportStatLabel}>Total Miles</Text>
                  </View>
                  <View style={styles.reportStat}>
                    <Text style={styles.reportStatValue}>{formatDistance(report.businessMiles)}</Text>
                    <Text style={styles.reportStatLabel}>Business Miles</Text>
                  </View>
                  <View style={styles.reportStat}>
                    <Text style={styles.reportStatValue}>${report.deduction.toFixed(2)}</Text>
                    <Text style={styles.reportStatLabel}>Deduction</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  currentTripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  currentTripTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tripActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  resumeButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  endButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  controlsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  controlsDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tripsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  tripsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  reportButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  noTripsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    paddingVertical: 20,
  },
  tripItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tripInfo: {
    flex: 1,
  },
  tripPurpose: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tripDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  tripDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  tripBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tripBadgeText: {
    color: '#1976D2',
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
  },
  saveText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    width: 50,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#007AFF',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  reportStat: {
    alignItems: 'center',
  },
  reportStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  reportStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});