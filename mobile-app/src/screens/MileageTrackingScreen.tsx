import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { apiService } from '../services/apiService';

interface MileageEntry {
  id: string;
  startLocation: string;
  endLocation: string;
  startTime: string;
  endTime?: string;
  distance: number;
  purpose: string;
  vehicleType: string;
  ratePerMile: number;
  totalAmount: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface Location {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
}

const MileageTrackingScreen: React.FC = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Partial<MileageEntry>>({
    startLocation: '',
    endLocation: '',
    purpose: '',
    vehicleType: 'Car',
    ratePerMile: 0.655, // 2024 IRS rate
  });
  const [tripStartTime, setTripStartTime] = useState<Date | null>(null);
  const [tripDistance, setTripDistance] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [mileageEntries, setMileageEntries] = useState<MileageEntry[]>([]);
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);

  useEffect(() => {
    loadMileageEntries();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({
          latitude,
          longitude,
          address: 'Current Location', // Would reverse geocode in real app
          timestamp: new Date().toISOString(),
        });
      },
      (error) => {
        console.error('Location error:', error);
        Alert.alert('Location Error', 'Unable to get current location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const loadMileageEntries = async () => {
    try {
      const entries = await apiService.getMileageEntries();
      setMileageEntries(entries);
    } catch (error) {
      console.error('Failed to load mileage entries:', error);
    }
  };

  const startTrip = () => {
    if (!currentLocation) {
      Alert.alert('Location Required', 'Please enable location services to track mileage');
      return;
    }

    setTripStartTime(new Date());
    setIsTracking(true);
    setTripDistance(0);
    setCurrentTrip(prev => ({
      ...prev,
      startLocation: currentLocation.address,
      startTime: new Date().toISOString(),
    }));
  };

  const stopTrip = () => {
    if (!tripStartTime) return;

    const endTime = new Date();
    const duration = (endTime.getTime() - tripStartTime.getTime()) / 1000 / 60; // minutes
    
    // Calculate distance (simplified - would use actual GPS tracking in real app)
    const estimatedDistance = duration * 0.5; // Rough estimate: 30 mph average
    
    setTripDistance(estimatedDistance);
    setCurrentTrip(prev => ({
      ...prev,
      endLocation: currentLocation?.address || 'End Location',
      endTime: endTime.toISOString(),
      distance: estimatedDistance,
      totalAmount: estimatedDistance * (prev.ratePerMile || 0.655),
    }));
    
    setIsTracking(false);
    setShowPurposeModal(true);
  };

  const saveMileageEntry = async () => {
    if (!currentTrip.purpose || !currentTrip.distance) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const entry: MileageEntry = {
        id: `mileage_${Date.now()}`,
        ...currentTrip,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
      } as MileageEntry;

      await apiService.createMileageEntry(entry);
      setMileageEntries(prev => [entry, ...prev]);
      
      // Reset trip
      setCurrentTrip({
        startLocation: '',
        endLocation: '',
        purpose: '',
        vehicleType: 'Car',
        ratePerMile: 0.655,
      });
      setTripStartTime(null);
      setTripDistance(0);
      setShowPurposeModal(false);
      setShowTripModal(false);

      Alert.alert('Success', 'Mileage entry saved successfully!');
    } catch (error) {
      console.error('Failed to save mileage entry:', error);
      Alert.alert('Error', 'Failed to save mileage entry');
    }
  };

  const formatDuration = (startTime: Date, endTime: Date) => {
    const duration = (endTime.getTime() - startTime.getTime()) / 1000 / 60;
    const hours = Math.floor(duration / 60);
    const minutes = Math.floor(duration % 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return '#FF9500';
      case 'SUBMITTED': return '#007AFF';
      case 'APPROVED': return '#34C759';
      case 'REJECTED': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const renderMileageEntry = ({ item }: { item: MileageEntry }) => (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={() => {
        setCurrentTrip(item);
        setShowTripModal(true);
      }}
    >
      <View style={styles.entryHeader}>
        <Text style={styles.entryPurpose}>{item.purpose}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.entryDetails}>
        <View style={styles.entryRow}>
          <Icon name="location-on" size={16} color="#666" />
          <Text style={styles.entryText}>{item.startLocation} → {item.endLocation}</Text>
        </View>
        
        <View style={styles.entryRow}>
          <Icon name="straighten" size={16} color="#666" />
          <Text style={styles.entryText}>{item.distance.toFixed(1)} miles</Text>
        </View>
        
        <View style={styles.entryRow}>
          <Icon name="attach-money" size={16} color="#666" />
          <Text style={styles.entryText}>${item.totalAmount.toFixed(2)}</Text>
        </View>
      </View>
      
      <Text style={styles.entryDate}>
        {new Date(item.startTime).toLocaleDateString()} at {new Date(item.startTime).toLocaleTimeString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Trip Tracking Section */}
      <View style={styles.trackingContainer}>
        <View style={styles.trackingHeader}>
          <Text style={styles.trackingTitle}>
            {isTracking ? 'Trip in Progress' : 'Start New Trip'}
          </Text>
          {isTracking && (
            <Text style={styles.trackingSubtitle}>
              {tripStartTime && formatDuration(tripStartTime, new Date())}
            </Text>
          )}
        </View>

        <View style={styles.trackingControls}>
          {!isTracking ? (
            <TouchableOpacity
              style={[styles.trackingButton, styles.startButton]}
              onPress={startTrip}
            >
              <Icon name="play-arrow" size={32} color="white" />
              <Text style={styles.buttonText}>Start Trip</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.trackingButton, styles.stopButton]}
              onPress={stopTrip}
            >
              <Icon name="stop" size={32} color="white" />
              <Text style={styles.buttonText}>End Trip</Text>
            </TouchableOpacity>
          )}
        </View>

        {isTracking && (
          <View style={styles.trackingInfo}>
            <Text style={styles.trackingInfoText}>
              Distance: {tripDistance.toFixed(1)} miles
            </Text>
            <Text style={styles.trackingInfoText}>
              Estimated Amount: ${(tripDistance * (currentTrip.ratePerMile || 0.655)).toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      {/* Mileage Entries List */}
      <View style={styles.entriesContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Trips</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={mileageEntries}
          renderItem={renderMileageEntry}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Purpose Modal */}
      <Modal
        visible={showPurposeModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPurposeModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Trip Details</Text>
            <TouchableOpacity onPress={saveMileageEntry}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.tripSummary}>
              <Text style={styles.summaryTitle}>Trip Summary</Text>
              <Text style={styles.summaryDistance}>
                {tripDistance.toFixed(1)} miles
              </Text>
              <Text style={styles.summaryAmount}>
                ${(tripDistance * (currentTrip.ratePerMile || 0.655)).toFixed(2)}
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Purpose *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Business meeting, client visit, etc."
                value={currentTrip.purpose}
                onChangeText={(text) => setCurrentTrip(prev => ({ ...prev, purpose: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Vehicle Type</Text>
              <TextInput
                style={styles.formInput}
                value={currentTrip.vehicleType}
                onChangeText={(text) => setCurrentTrip(prev => ({ ...prev, vehicleType: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Rate per Mile</Text>
              <TextInput
                style={styles.formInput}
                value={currentTrip.ratePerMile?.toString()}
                onChangeText={(text) => setCurrentTrip(prev => ({ ...prev, ratePerMile: parseFloat(text) || 0 }))}
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Trip Details Modal */}
      <Modal
        visible={showTripModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTripModal(false)}>
              <Text style={styles.modalCancelText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Trip Details</Text>
            <TouchableOpacity onPress={() => setShowTripModal(false)}>
              <Text style={styles.modalSaveText}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {currentTrip && (
              <>
                <View style={styles.tripDetails}>
                  <Text style={styles.detailLabel}>Purpose</Text>
                  <Text style={styles.detailValue}>{currentTrip.purpose}</Text>
                  
                  <Text style={styles.detailLabel}>Route</Text>
                  <Text style={styles.detailValue}>
                    {currentTrip.startLocation} → {currentTrip.endLocation}
                  </Text>
                  
                  <Text style={styles.detailLabel}>Distance</Text>
                  <Text style={styles.detailValue}>{currentTrip.distance?.toFixed(1)} miles</Text>
                  
                  <Text style={styles.detailLabel}>Amount</Text>
                  <Text style={styles.detailValue}>${currentTrip.totalAmount?.toFixed(2)}</Text>
                  
                  <Text style={styles.detailLabel}>Vehicle</Text>
                  <Text style={styles.detailValue}>{currentTrip.vehicleType}</Text>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  trackingContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackingHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  trackingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  trackingSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  trackingControls: {
    alignItems: 'center',
    marginBottom: 20,
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 150,
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#34C759',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  trackingInfo: {
    alignItems: 'center',
  },
  trackingInfoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  entriesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 14,
  },
  entryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryPurpose: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  entryDetails: {
    marginBottom: 8,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  entryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  entryDate: {
    fontSize: 12,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  tripSummary: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  summaryDistance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#34C759',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  tripDetails: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    marginTop: 12,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default MileageTrackingScreen;
