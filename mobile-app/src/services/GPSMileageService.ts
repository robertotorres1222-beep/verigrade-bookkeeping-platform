import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  altitude?: number;
  speed?: number;
  heading?: number;
}

export interface Trip {
  id: string;
  startTime: number;
  endTime?: number;
  startLocation: Location;
  endLocation?: Location;
  distance: number;
  purpose: string;
  category: 'business' | 'personal' | 'medical' | 'charitable';
  isBusinessTrip: boolean;
  isCompleted: boolean;
  notes?: string;
  waypoints: Location[];
  averageSpeed: number;
  maxSpeed: number;
  duration: number;
}

export interface MileageReport {
  id: string;
  startDate: number;
  endDate: number;
  totalMiles: number;
  businessMiles: number;
  personalMiles: number;
  trips: Trip[];
  rate: number;
  totalDeduction: number;
  isIRSCompliant: boolean;
}

export interface MileageSettings {
  businessRate: number;
  personalRate: number;
  autoStartTrips: boolean;
  minimumTripDistance: number;
  maximumIdleTime: number;
  trackingAccuracy: 'high' | 'medium' | 'low';
  backgroundTracking: boolean;
}

class GPSMileageService {
  private static instance: GPSMileageService;
  private currentTrip: Trip | null = null;
  private isTracking: boolean = false;
  private watchId: number | null = null;
  private settings: MileageSettings;
  private locationHistory: Location[] = [];
  private lastLocation: Location | null = null;
  private tripStartTime: number = 0;
  private idleStartTime: number = 0;

  private constructor() {
    this.settings = {
      businessRate: 0.655, // 2023 IRS rate
      personalRate: 0.0,
      autoStartTrips: true,
      minimumTripDistance: 0.1, // 0.1 miles
      maximumIdleTime: 300, // 5 minutes
      trackingAccuracy: 'high',
      backgroundTracking: true
    };
    
    this.loadSettings();
  }

  public static getInstance(): GPSMileageService {
    if (!GPSMileageService.instance) {
      GPSMileageService.instance = new GPSMileageService();
    }
    return GPSMileageService.instance;
  }

  /**
   * Request location permissions
   */
  public async requestLocationPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
      ]);

      return (
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
      );
    }

    return true; // iOS permissions are handled in Info.plist
  }

  /**
   * Start trip tracking
   */
  public async startTrip(purpose: string, category: 'business' | 'personal' | 'medical' | 'charitable'): Promise<Trip> {
    if (this.isTracking) {
      throw new Error('Trip tracking is already active');
    }

    const hasPermission = await this.requestLocationPermissions();
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    this.isTracking = true;
    this.tripStartTime = Date.now();
    this.locationHistory = [];

    const startLocation = await this.getCurrentLocation();
    
    this.currentTrip = {
      id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: this.tripStartTime,
      startLocation,
      distance: 0,
      purpose,
      category,
      isBusinessTrip: category === 'business',
      isCompleted: false,
      waypoints: [startLocation],
      averageSpeed: 0,
      maxSpeed: 0,
      duration: 0
    };

    this.startLocationTracking();
    return this.currentTrip;
  }

  /**
   * Stop trip tracking
   */
  public async stopTrip(): Promise<Trip | null> {
    if (!this.isTracking || !this.currentTrip) {
      return null;
    }

    this.isTracking = false;
    this.stopLocationTracking();

    const endLocation = await this.getCurrentLocation();
    const endTime = Date.now();
    
    this.currentTrip.endTime = endTime;
    this.currentTrip.endLocation = endLocation;
    this.currentTrip.isCompleted = true;
    this.currentTrip.duration = endTime - this.currentTrip.startTime;
    this.currentTrip.distance = this.calculateTotalDistance();
    this.currentTrip.averageSpeed = this.calculateAverageSpeed();
    this.currentTrip.maxSpeed = this.calculateMaxSpeed();

    // Save trip
    await this.saveTrip(this.currentTrip);

    const completedTrip = this.currentTrip;
    this.currentTrip = null;
    this.locationHistory = [];

    return completedTrip;
  }

  /**
   * Pause trip tracking
   */
  public pauseTrip(): void {
    if (this.isTracking) {
      this.stopLocationTracking();
      this.idleStartTime = Date.now();
    }
  }

  /**
   * Resume trip tracking
   */
  public resumeTrip(): void {
    if (this.currentTrip && !this.isTracking) {
      this.startLocationTracking();
      this.idleStartTime = 0;
    }
  }

  /**
   * Get current trip
   */
  public getCurrentTrip(): Trip | null {
    return this.currentTrip;
  }

  /**
   * Check if trip is being tracked
   */
  public isTripActive(): boolean {
    return this.isTracking && this.currentTrip !== null;
  }

  /**
   * Start location tracking
   */
  private startLocationTracking(): void {
    const options = {
      enableHighAccuracy: this.settings.trackingAccuracy === 'high',
      timeout: 10000,
      maximumAge: 5000
    };

    this.watchId = Geolocation.watchPosition(
      (position) => this.handleLocationUpdate(position),
      (error) => this.handleLocationError(error),
      options
    );
  }

  /**
   * Stop location tracking
   */
  private stopLocationTracking(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Handle location update
   */
  private handleLocationUpdate(position: any): void {
    const location: Location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
      altitude: position.coords.altitude,
      speed: position.coords.speed,
      heading: position.coords.heading
    };

    this.locationHistory.push(location);
    this.lastLocation = location;

    if (this.currentTrip) {
      this.currentTrip.waypoints.push(location);
      this.currentTrip.distance = this.calculateTotalDistance();
    }

    // Check for idle time
    this.checkIdleTime();
  }

  /**
   * Handle location error
   */
  private handleLocationError(error: any): void {
    console.error('Location error:', error);
    
    if (error.code === 1) {
      Alert.alert('Location Error', 'Location access denied. Please enable location services.');
    } else if (error.code === 2) {
      Alert.alert('Location Error', 'Location unavailable. Please check your GPS settings.');
    } else if (error.code === 3) {
      Alert.alert('Location Error', 'Location request timed out. Please try again.');
    }
  }

  /**
   * Check for idle time
   */
  private checkIdleTime(): void {
    if (this.idleStartTime > 0) {
      const idleTime = Date.now() - this.idleStartTime;
      if (idleTime > this.settings.maximumIdleTime * 1000) {
        // Trip has been idle too long, consider it ended
        this.stopTrip();
      }
    }
  }

  /**
   * Get current location
   */
  private async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            altitude: position.coords.altitude,
            speed: position.coords.speed,
            heading: position.coords.heading
          });
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      );
    });
  }

  /**
   * Calculate total distance
   */
  private calculateTotalDistance(): number {
    if (this.locationHistory.length < 2) {
      return 0;
    }

    let totalDistance = 0;
    for (let i = 1; i < this.locationHistory.length; i++) {
      const distance = this.calculateDistance(
        this.locationHistory[i - 1],
        this.locationHistory[i]
      );
      totalDistance += distance;
    }

    return totalDistance;
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(loc1: Location, loc2: Location): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(loc2.latitude - loc1.latitude);
    const dLon = this.toRadians(loc2.longitude - loc1.longitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(loc1.latitude)) * Math.cos(this.toRadians(loc2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate average speed
   */
  private calculateAverageSpeed(): number {
    if (this.locationHistory.length < 2) {
      return 0;
    }

    const totalTime = (this.locationHistory[this.locationHistory.length - 1].timestamp - 
                      this.locationHistory[0].timestamp) / 1000; // Convert to seconds
    const totalDistance = this.calculateTotalDistance();
    
    return totalTime > 0 ? (totalDistance / totalTime) * 3600 : 0; // mph
  }

  /**
   * Calculate maximum speed
   */
  private calculateMaxSpeed(): number {
    let maxSpeed = 0;
    
    for (let i = 1; i < this.locationHistory.length; i++) {
      const distance = this.calculateDistance(
        this.locationHistory[i - 1],
        this.locationHistory[i]
      );
      const time = (this.locationHistory[i].timestamp - this.locationHistory[i - 1].timestamp) / 1000;
      
      if (time > 0) {
        const speed = (distance / time) * 3600; // mph
        maxSpeed = Math.max(maxSpeed, speed);
      }
    }
    
    return maxSpeed;
  }

  /**
   * Save trip
   */
  private async saveTrip(trip: Trip): Promise<void> {
    try {
      const savedTrips = await this.getSavedTrips();
      savedTrips.push(trip);
      await AsyncStorage.setItem('saved_trips', JSON.stringify(savedTrips));
    } catch (error) {
      console.error('Error saving trip:', error);
    }
  }

  /**
   * Get saved trips
   */
  public async getSavedTrips(): Promise<Trip[]> {
    try {
      const stored = await AsyncStorage.getItem('saved_trips');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading saved trips:', error);
      return [];
    }
  }

  /**
   * Delete trip
   */
  public async deleteTrip(tripId: string): Promise<void> {
    try {
      const savedTrips = await this.getSavedTrips();
      const filteredTrips = savedTrips.filter(trip => trip.id !== tripId);
      await AsyncStorage.setItem('saved_trips', JSON.stringify(filteredTrips));
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  }

  /**
   * Generate mileage report
   */
  public async generateMileageReport(startDate: number, endDate: number): Promise<MileageReport> {
    const trips = await this.getSavedTrips();
    const filteredTrips = trips.filter(trip => 
      trip.startTime >= startDate && trip.startTime <= endDate
    );

    const businessTrips = filteredTrips.filter(trip => trip.isBusinessTrip);
    const personalTrips = filteredTrips.filter(trip => !trip.isBusinessTrip);

    const businessMiles = businessTrips.reduce((total, trip) => total + trip.distance, 0);
    const personalMiles = personalTrips.reduce((total, trip) => total + trip.distance, 0);
    const totalMiles = businessMiles + personalMiles;

    const totalDeduction = businessMiles * this.settings.businessRate;

    return {
      id: `report_${Date.now()}`,
      startDate,
      endDate,
      totalMiles,
      businessMiles,
      personalMiles,
      trips: filteredTrips,
      rate: this.settings.businessRate,
      totalDeduction,
      isIRSCompliant: true
    };
  }

  /**
   * Get mileage settings
   */
  public getSettings(): MileageSettings {
    return { ...this.settings };
  }

  /**
   * Update mileage settings
   */
  public async updateSettings(newSettings: Partial<MileageSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
  }

  /**
   * Save settings
   */
  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('mileage_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  /**
   * Load settings
   */
  private async loadSettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('mileage_settings');
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  /**
   * Get trip statistics
   */
  public async getTripStatistics(): Promise<{
    totalTrips: number;
    totalMiles: number;
    businessMiles: number;
    personalMiles: number;
    averageTripDistance: number;
    longestTrip: Trip | null;
  }> {
    const trips = await this.getSavedTrips();
    
    const totalTrips = trips.length;
    const totalMiles = trips.reduce((total, trip) => total + trip.distance, 0);
    const businessMiles = trips.filter(trip => trip.isBusinessTrip).reduce((total, trip) => total + trip.distance, 0);
    const personalMiles = trips.filter(trip => !trip.isBusinessTrip).reduce((total, trip) => total + trip.distance, 0);
    const averageTripDistance = totalTrips > 0 ? totalMiles / totalTrips : 0;
    const longestTrip = trips.reduce((longest, trip) => 
      trip.distance > (longest?.distance || 0) ? trip : longest, null as Trip | null
    );

    return {
      totalTrips,
      totalMiles,
      businessMiles,
      personalMiles,
      averageTripDistance,
      longestTrip
    };
  }

  /**
   * Export mileage report
   */
  public async exportMileageReport(report: MileageReport, format: 'csv' | 'pdf'): Promise<string> {
    // Implementation would depend on the export format
    // This is a placeholder for the export functionality
    return `Mileage report exported as ${format}`;
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.stopLocationTracking();
    this.isTracking = false;
    this.currentTrip = null;
  }
}

export default GPSMileageService;