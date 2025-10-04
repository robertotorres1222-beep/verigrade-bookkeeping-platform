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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { apiService } from '../services/apiService';

interface TimeEntry {
  id: string;
  projectId?: string;
  clientId?: string;
  description: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  hourlyRate: number;
  billableAmount: number;
  isBillable: boolean;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'BILLED';
}

interface Project {
  id: string;
  name: string;
  clientId?: string;
  hourlyRate?: number;
}

interface TimerState {
  isRunning: boolean;
  startTime: Date | null;
  elapsedTime: number;
}

const TimeTrackingScreen: React.FC = () => {
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    startTime: null,
    elapsedTime: 0,
  });
  const [currentEntry, setCurrentEntry] = useState<Partial<TimeEntry>>({
    description: '',
    projectId: undefined,
    isBillable: true,
    hourlyRate: 75,
  });
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  useEffect(() => {
    loadTimeEntries();
    loadProjects();
    loadTimerInterval();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer.isRunning) {
      interval = setInterval(() => {
        setTimer(prev => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 1,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer.isRunning]);

  const loadTimeEntries = async () => {
    try {
      const entries = await apiService.getTimeEntries();
      setTimeEntries(entries);
    } catch (error) {
      console.error('Failed to load time entries:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const projectData = await apiService.getProjects();
      setProjects(projectData);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadTimerInterval = () => {
    // Load any running timer from storage
    // This would typically come from AsyncStorage
  };

  const startTimer = () => {
    if (!currentEntry.description.trim()) {
      Alert.alert('Error', 'Please enter a description before starting the timer');
      return;
    }

    setTimer({
      isRunning: true,
      startTime: new Date(),
      elapsedTime: 0,
    });
  };

  const stopTimer = () => {
    setTimer(prev => ({
      ...prev,
      isRunning: false,
    }));
    setShowEntryModal(true);
  };

  const pauseTimer = () => {
    setTimer(prev => ({
      ...prev,
      isRunning: false,
    }));
  };

  const resumeTimer = () => {
    setTimer(prev => ({
      ...prev,
      isRunning: true,
    }));
  };

  const saveTimeEntry = async () => {
    if (!timer.startTime) return;

    try {
      const entry: TimeEntry = {
        id: `time_${Date.now()}`,
        ...currentEntry,
        startTime: timer.startTime.toISOString(),
        endTime: new Date().toISOString(),
        durationMinutes: Math.floor(timer.elapsedTime / 60),
        billableAmount: (timer.elapsedTime / 60) * (currentEntry.hourlyRate || 75),
        status: 'DRAFT',
      } as TimeEntry;

      await apiService.createTimeEntry(entry);
      setTimeEntries(prev => [entry, ...prev]);
      
      // Reset timer and entry
      setTimer({ isRunning: false, startTime: null, elapsedTime: 0 });
      setCurrentEntry({
        description: '',
        projectId: undefined,
        isBillable: true,
        hourlyRate: 75,
      });
      setShowEntryModal(false);

      Alert.alert('Success', 'Time entry saved successfully!');
    } catch (error) {
      console.error('Failed to save time entry:', error);
      Alert.alert('Error', 'Failed to save time entry');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return '#FF9500';
      case 'SUBMITTED': return '#007AFF';
      case 'APPROVED': return '#34C759';
      case 'BILLED': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const renderTimeEntry = ({ item }: { item: TimeEntry }) => (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={() => {
        setEditingEntry(item);
        setShowEntryModal(true);
      }}
    >
      <View style={styles.entryHeader}>
        <Text style={styles.entryDescription}>{item.description}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.entryDetails}>
        <View style={styles.entryRow}>
          <Icon name="access-time" size={16} color="#666" />
          <Text style={styles.entryText}>{formatDuration(item.durationMinutes)}</Text>
        </View>
        
        <View style={styles.entryRow}>
          <Icon name="attach-money" size={16} color="#666" />
          <Text style={styles.entryText}>${item.billableAmount.toFixed(2)}</Text>
        </View>
        
        {item.projectId && (
          <View style={styles.entryRow}>
            <Icon name="work" size={16} color="#666" />
            <Text style={styles.entryText}>
              {projects.find(p => p.id === item.projectId)?.name || 'Unknown Project'}
            </Text>
          </View>
        )}
      </View>
      
      <Text style={styles.entryDate}>
        {new Date(item.startTime).toLocaleDateString()} at {new Date(item.startTime).toLocaleTimeString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Timer Section */}
      <View style={styles.timerContainer}>
        <View style={styles.timerDisplay}>
          <Text style={styles.timerText}>{formatTime(timer.elapsedTime)}</Text>
          <Text style={styles.timerSubtext}>
            {timer.isRunning ? 'Timer Running' : 'Timer Stopped'}
          </Text>
        </View>

        <View style={styles.timerControls}>
          {!timer.isRunning ? (
            <TouchableOpacity
              style={[styles.timerButton, styles.startButton]}
              onPress={timer.elapsedTime > 0 ? resumeTimer : startTimer}
            >
              <Icon name="play-arrow" size={32} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.timerButton, styles.pauseButton]}
              onPress={pauseTimer}
            >
              <Icon name="pause" size={32} color="white" />
            </TouchableOpacity>
          )}

          {timer.elapsedTime > 0 && (
            <TouchableOpacity
              style={[styles.timerButton, styles.stopButton]}
              onPress={stopTimer}
            >
              <Icon name="stop" size={32} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Current Entry Info */}
      <View style={styles.currentEntryContainer}>
        <Text style={styles.sectionTitle}>Current Entry</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={styles.textInput}
            placeholder="What are you working on?"
            value={currentEntry.description}
            onChangeText={(text) => setCurrentEntry(prev => ({ ...prev, description: text }))}
            multiline
          />
        </View>

        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.projectButton}
            onPress={() => setShowProjectModal(true)}
          >
            <Icon name="work" size={20} color="#007AFF" />
            <Text style={styles.projectButtonText}>
              {currentEntry.projectId 
                ? projects.find(p => p.id === currentEntry.projectId)?.name || 'Select Project'
                : 'Select Project'
              }
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.billableButton}
            onPress={() => setCurrentEntry(prev => ({ ...prev, isBillable: !prev.isBillable }))}
          >
            <Icon 
              name={currentEntry.isBillable ? "check-circle" : "radio-button-unchecked"} 
              size={20} 
              color={currentEntry.isBillable ? "#34C759" : "#8E8E93"} 
            />
            <Text style={styles.billableButtonText}>Billable</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Time Entries List */}
      <View style={styles.entriesContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={timeEntries}
          renderItem={renderTimeEntry}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Project Selection Modal */}
      <Modal
        visible={showProjectModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProjectModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Project</Text>
            <TouchableOpacity onPress={() => setShowProjectModal(false)}>
              <Text style={styles.modalSaveText}>Done</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={projects}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.projectItem}
                onPress={() => {
                  setCurrentEntry(prev => ({ 
                    ...prev, 
                    projectId: item.id,
                    hourlyRate: item.hourlyRate || prev.hourlyRate 
                  }));
                  setShowProjectModal(false);
                }}
              >
                <Text style={styles.projectName}>{item.name}</Text>
                {item.hourlyRate && (
                  <Text style={styles.projectRate}>${item.hourlyRate}/hour</Text>
                )}
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
      </Modal>

      {/* Entry Details Modal */}
      <Modal
        visible={showEntryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEntryModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingEntry ? 'Edit Entry' : 'Save Entry'}
            </Text>
            <TouchableOpacity onPress={saveTimeEntry}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.entrySummary}>
              <Text style={styles.summaryTitle}>Time Summary</Text>
              <Text style={styles.summaryDuration}>{formatTime(timer.elapsedTime)}</Text>
              <Text style={styles.summaryAmount}>
                ${((timer.elapsedTime / 60) * (currentEntry.hourlyRate || 75)).toFixed(2)}
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={styles.formInput}
                value={currentEntry.description}
                onChangeText={(text) => setCurrentEntry(prev => ({ ...prev, description: text }))}
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Hourly Rate</Text>
              <TextInput
                style={styles.formInput}
                value={currentEntry.hourlyRate?.toString()}
                onChangeText={(text) => setCurrentEntry(prev => ({ ...prev, hourlyRate: parseFloat(text) || 0 }))}
                keyboardType="numeric"
              />
            </View>
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
  timerContainer: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'monospace',
  },
  timerSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  startButton: {
    backgroundColor: '#34C759',
  },
  pauseButton: {
    backgroundColor: '#FF9500',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  currentEntryContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    minHeight: 40,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    marginRight: 10,
  },
  projectButtonText: {
    marginLeft: 8,
    color: '#007AFF',
    fontSize: 14,
  },
  billableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  billableButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
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
  entryDescription: {
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
  entrySummary: {
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
  summaryDuration: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'monospace',
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#34C759',
    marginTop: 4,
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
  projectItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  projectName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  projectRate: {
    fontSize: 14,
    color: '#666',
  },
});

export default TimeTrackingScreen;
