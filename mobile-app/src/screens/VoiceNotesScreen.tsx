import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';

interface VoiceNote {
  id: string;
  title: string;
  transcript: string;
  audioUri: string;
  duration: number;
  createdAt: Date;
  category: string;
  tags: string[];
  isTranscribed: boolean;
  isProcessing: boolean;
}

const VoiceNotesScreen: React.FC = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<VoiceNote | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  const categories = ['all', 'meeting', 'expense', 'invoice', 'general'];
  const tags = ['urgent', 'follow-up', 'client', 'internal', 'expense', 'invoice'];

  useEffect(() => {
    requestAudioPermission();
    loadVoiceNotes();
  }, []);

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
      startRecordingTimer();
    } else {
      stopPulseAnimation();
      stopRecordingTimer();
    }
  }, [isRecording]);

  const requestAudioPermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Audio recording permission is required for voice notes');
    }
  };

  const loadVoiceNotes = async () => {
    try {
      setIsLoading(true);
      // Mock data for demonstration
      const mockNotes: VoiceNote[] = [
        {
          id: '1',
          title: 'Client Meeting Notes',
          transcript: 'Discussed quarterly financial review with ABC Corp. They need updated reports by Friday. Follow up on invoice #1234.',
          audioUri: 'mock-audio-1.mp3',
          duration: 120,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          category: 'meeting',
          tags: ['client', 'follow-up'],
          isTranscribed: true,
          isProcessing: false,
        },
        {
          id: '2',
          title: 'Expense Receipt',
          transcript: 'Lunch meeting with potential client at downtown restaurant. Total cost $45.50 including tip. Business development expense.',
          audioUri: 'mock-audio-2.mp3',
          duration: 45,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          category: 'expense',
          tags: ['expense', 'client'],
          isTranscribed: true,
          isProcessing: false,
        },
        {
          id: '3',
          title: 'Quick Reminder',
          transcript: '',
          audioUri: 'mock-audio-3.mp3',
          duration: 30,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
          category: 'general',
          tags: ['urgent'],
          isTranscribed: false,
          isProcessing: true,
        }
      ];
      setNotes(mockNotes);
    } catch (error) {
      console.error('Error loading voice notes:', error);
      Alert.alert('Error', 'Failed to load voice notes');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      setRecording(null);

      // Create new voice note
      const newNote: VoiceNote = {
        id: Date.now().toString(),
        title: `Voice Note ${format(new Date(), 'MMM dd, HH:mm')}`,
        transcript: '',
        audioUri: uri || '',
        duration: recordingDuration,
        createdAt: new Date(),
        category: 'general',
        tags: [],
        isTranscribed: false,
        isProcessing: true,
      };

      setNotes(prev => [newNote, ...prev]);
      setRecordingDuration(0);

      // Simulate transcription processing
      setTimeout(() => {
        setNotes(prev => prev.map(note => 
          note.id === newNote.id 
            ? { ...note, isTranscribed: true, isProcessing: false, transcript: 'This is a mock transcription of the voice note.' }
            : note
        ));
      }, 3000);

    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const playAudio = async (note: VoiceNote) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: note.audioUri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPlaybackPosition(status.positionMillis || 0);
          setPlaybackDuration(status.durationMillis || 0);
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      });

    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
      setPlaybackPosition(0);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const startRecordingTimer = () => {
    recordingInterval.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.transcript.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const updateNote = (noteId: string, updates: Partial<VoiceNote>) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, ...updates } : note
    ));
  };

  const deleteNote = (noteId: string) => {
    Alert.alert(
      'Delete Voice Note',
      'Are you sure you want to delete this voice note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setNotes(prev => prev.filter(note => note.id !== noteId));
            if (selectedNote?.id === noteId) {
              setSelectedNote(null);
            }
          }
        }
      ]
    );
  };

  const exportNote = (note: VoiceNote) => {
    Alert.alert('Export Note', 'Voice note exported successfully');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Notes</Text>
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordingButton]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Icon 
              name={isRecording ? "stop" : "mic"} 
              size={24} 
              color="white" 
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {isRecording && (
        <View style={styles.recordingInfo}>
          <Text style={styles.recordingText}>
            Recording: {formatDuration(recordingDuration)}
          </Text>
          <Text style={styles.recordingSubtext}>
            Tap the microphone to stop
          </Text>
        </View>
      )}

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search voice notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.categoriesContainer} horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.selectedCategoryChip
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.selectedCategoryText
            ]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.notesContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#3B82F6" />
        ) : (
          filteredNotes.map((note) => (
            <TouchableOpacity
              key={note.id}
              style={styles.noteCard}
              onPress={() => {
                setSelectedNote(note);
                setShowNoteModal(true);
              }}
            >
              <View style={styles.noteHeader}>
                <Text style={styles.noteTitle}>{note.title}</Text>
                <View style={styles.noteActions}>
                  <TouchableOpacity
                    onPress={() => playAudio(note)}
                    style={styles.actionButton}
                  >
                    <Icon name="play-arrow" size={20} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => exportNote(note)}
                    style={styles.actionButton}
                  >
                    <Icon name="share" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.noteDate}>
                {format(note.createdAt, 'MMM dd, yyyy • HH:mm')}
              </Text>
              
              <Text style={styles.noteDuration}>
                Duration: {formatDuration(note.duration)}
              </Text>

              {note.isProcessing ? (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Text style={styles.processingText}>Processing transcription...</Text>
                </View>
              ) : note.isTranscribed ? (
                <Text style={styles.noteTranscript} numberOfLines={2}>
                  {note.transcript}
                </Text>
              ) : (
                <Text style={styles.noteTranscript}>No transcription available</Text>
              )}

              <View style={styles.noteTags}>
                <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(note.category) }]}>
                  <Text style={styles.categoryTagText}>{note.category}</Text>
                </View>
                {note.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Note Detail Modal */}
      <Modal
        visible={showNoteModal && !!selectedNote}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedNote && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Voice Note Details</Text>
              <TouchableOpacity
                onPress={() => setShowNoteModal(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>Title</Text>
                <TextInput
                  style={styles.detailInput}
                  value={selectedNote.title}
                  onChangeText={(text) => updateNote(selectedNote.id, { title: text })}
                />
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.filter(cat => cat !== 'all').map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        selectedNote.category === category && styles.selectedCategoryOption
                      ]}
                      onPress={() => updateNote(selectedNote.id, { category })}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        selectedNote.category === category && styles.selectedCategoryOptionText
                      ]}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>Tags</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {tags.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.tagOption,
                        selectedNote.tags.includes(tag) && styles.selectedTagOption
                      ]}
                      onPress={() => {
                        const newTags = selectedNote.tags.includes(tag)
                          ? selectedNote.tags.filter(t => t !== tag)
                          : [...selectedNote.tags, tag];
                        updateNote(selectedNote.id, { tags: newTags });
                      }}
                    >
                      <Text style={[
                        styles.tagOptionText,
                        selectedNote.tags.includes(tag) && styles.selectedTagOptionText
                      ]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>Transcript</Text>
                <TextInput
                  style={[styles.detailInput, styles.textArea]}
                  value={selectedNote.transcript}
                  onChangeText={(text) => updateNote(selectedNote.id, { transcript: text })}
                  multiline
                  numberOfLines={6}
                  placeholder="No transcription available"
                />
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>Audio Controls</Text>
                <View style={styles.audioControls}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => isPlaying ? stopAudio() : playAudio(selectedNote)}
                  >
                    <Icon 
                      name={isPlaying ? "pause" : "play-arrow"} 
                      size={24} 
                      color="white" 
                    />
                  </TouchableOpacity>
                  <Text style={styles.audioInfo}>
                    {formatDuration(Math.floor(playbackPosition / 1000))} / {formatDuration(selectedNote.duration)}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  deleteNote(selectedNote.id);
                  setShowNoteModal(false);
                }}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => setShowNoteModal(false)}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'meeting':
      return '#3B82F6';
    case 'expense':
      return '#10B981';
    case 'invoice':
      return '#F59E0B';
    case 'general':
      return '#6B7280';
    default:
      return '#6B7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  recordButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  recordingButton: {
    backgroundColor: '#EF4444',
  },
  recordingInfo: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    alignItems: 'center',
  },
  recordingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
  },
  recordingSubtext: {
    fontSize: 14,
    color: '#DC2626',
    marginTop: 4,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#3B82F6',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedCategoryText: {
    color: 'white',
  },
  notesContainer: {
    flex: 1,
    padding: 16,
  },
  noteCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  noteActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  noteDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  noteDuration: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  noteTranscript: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  processingText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 8,
  },
  noteTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  detailCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  detailInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  selectedCategoryOption: {
    backgroundColor: '#3B82F6',
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedCategoryOptionText: {
    color: 'white',
  },
  tagOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTagOption: {
    backgroundColor: '#3B82F6',
  },
  tagOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedTagOptionText: {
    color: 'white',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  audioInfo: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  deleteButton: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    marginLeft: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
});

export default VoiceNotesScreen;

