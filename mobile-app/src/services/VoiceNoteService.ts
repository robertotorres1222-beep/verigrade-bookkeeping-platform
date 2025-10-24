import { Platform, Alert, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { AudioRecorder, AudioUtils } from 'react-native-audio';

export interface VoiceNote {
  id: string;
  title: string;
  transcription: string;
  audioPath: string;
  duration: number;
  createdAt: number;
  updatedAt: number;
  category: string;
  tags: string[];
  isTranscribed: boolean;
  confidence: number;
  language: string;
  metadata: {
    sampleRate: number;
    channels: number;
    bitRate: number;
    format: string;
  };
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
  segments: {
    start: number;
    end: number;
    text: string;
    confidence: number;
  }[];
}

export interface VoiceSearchResult {
  query: string;
  results: any[];
  confidence: number;
  timestamp: number;
}

class VoiceNoteService {
  private static instance: VoiceNoteService;
  private isRecording: boolean = false;
  private currentRecordingPath: string = '';
  private recordingStartTime: number = 0;
  private audioRecorder: any = null;
  private transcriptionService: any = null;

  private constructor() {
    this.initializeAudioRecorder();
  }

  public static getInstance(): VoiceNoteService {
    if (!VoiceNoteService.instance) {
      VoiceNoteService.instance = new VoiceNoteService();
    }
    return VoiceNoteService.instance;
  }

  /**
   * Initialize audio recorder
   */
  private initializeAudioRecorder(): void {
    AudioRecorder.prepareRecordingAtPath(
      AudioUtils.DocumentDirectoryPath + '/voice_note_' + Date.now() + '.m4a',
      {
        SampleRate: 22050,
        Channels: 1,
        AudioQuality: 'High',
        AudioEncoding: 'aac',
        AudioEncodingBitRate: 32000,
        OutputFormat: 'mpeg4'
      }
    );
  }

  /**
   * Request audio permissions
   */
  public async requestAudioPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      ]);

      return (
        granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED
      );
    }

    return true; // iOS permissions are handled in Info.plist
  }

  /**
   * Start recording voice note
   */
  public async startRecording(): Promise<void> {
    if (this.isRecording) {
      throw new Error('Recording is already in progress');
    }

    const hasPermission = await this.requestAudioPermissions();
    if (!hasPermission) {
      throw new Error('Audio recording permission denied');
    }

    try {
      this.currentRecordingPath = AudioUtils.DocumentDirectoryPath + '/voice_note_' + Date.now() + '.m4a';
      this.recordingStartTime = Date.now();
      
      await AudioRecorder.startRecording();
      this.isRecording = true;
    } catch (error) {
      throw new Error('Failed to start recording: ' + error);
    }
  }

  /**
   * Stop recording voice note
   */
  public async stopRecording(): Promise<VoiceNote> {
    if (!this.isRecording) {
      throw new Error('No recording in progress');
    }

    try {
      await AudioRecorder.stopRecording();
      this.isRecording = false;

      const duration = Date.now() - this.recordingStartTime;
      
      // Create voice note object
      const voiceNote: VoiceNote = {
        id: `voice_note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `Voice Note ${new Date().toLocaleDateString()}`,
        transcription: '',
        audioPath: this.currentRecordingPath,
        duration,
        createdAt: this.recordingStartTime,
        updatedAt: Date.now(),
        category: 'general',
        tags: [],
        isTranscribed: false,
        confidence: 0,
        language: 'en-US',
        metadata: {
          sampleRate: 22050,
          channels: 1,
          bitRate: 32000,
          format: 'm4a'
        }
      };

      // Save voice note
      await this.saveVoiceNote(voiceNote);

      return voiceNote;
    } catch (error) {
      throw new Error('Failed to stop recording: ' + error);
    }
  }

  /**
   * Pause recording
   */
  public async pauseRecording(): Promise<void> {
    if (!this.isRecording) {
      throw new Error('No recording in progress');
    }

    try {
      await AudioRecorder.pauseRecording();
    } catch (error) {
      throw new Error('Failed to pause recording: ' + error);
    }
  }

  /**
   * Resume recording
   */
  public async resumeRecording(): Promise<void> {
    if (!this.isRecording) {
      throw new Error('No recording in progress');
    }

    try {
      await AudioRecorder.resumeRecording();
    } catch (error) {
      throw new Error('Failed to resume recording: ' + error);
    }
  }

  /**
   * Cancel recording
   */
  public async cancelRecording(): Promise<void> {
    if (!this.isRecording) {
      return;
    }

    try {
      await AudioRecorder.stopRecording();
      this.isRecording = false;
      
      // Delete the recording file
      if (await RNFS.exists(this.currentRecordingPath)) {
        await RNFS.unlink(this.currentRecordingPath);
      }
    } catch (error) {
      console.error('Error canceling recording:', error);
    }
  }

  /**
   * Check if recording is in progress
   */
  public isRecordingActive(): boolean {
    return this.isRecording;
  }

  /**
   * Transcribe voice note
   */
  public async transcribeVoiceNote(voiceNoteId: string): Promise<TranscriptionResult> {
    try {
      const voiceNote = await this.getVoiceNote(voiceNoteId);
      if (!voiceNote) {
        throw new Error('Voice note not found');
      }

      // Check if file exists
      if (!(await RNFS.exists(voiceNote.audioPath))) {
        throw new Error('Audio file not found');
      }

      // Read audio file
      const audioData = await RNFS.readFile(voiceNote.audioPath, 'base64');
      
      // Send to transcription service
      const transcriptionResult = await this.sendToTranscriptionService(audioData, voiceNote.language);
      
      // Update voice note with transcription
      voiceNote.transcription = transcriptionResult.text;
      voiceNote.isTranscribed = true;
      voiceNote.confidence = transcriptionResult.confidence;
      voiceNote.updatedAt = Date.now();
      
      await this.updateVoiceNote(voiceNote);
      
      return transcriptionResult;
    } catch (error) {
      throw new Error('Transcription failed: ' + error);
    }
  }

  /**
   * Send audio to transcription service
   */
  private async sendToTranscriptionService(audioData: string, language: string): Promise<TranscriptionResult> {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/api/transcription/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          audioData,
          language,
          format: 'm4a'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return result.transcription;
      } else {
        throw new Error(result.error || 'Transcription failed');
      }
    } catch (error) {
      throw new Error('Transcription service error: ' + error);
    }
  }

  /**
   * Perform voice search
   */
  public async performVoiceSearch(query: string): Promise<VoiceSearchResult> {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/api/search/voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          query,
          type: 'voice_search'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          query,
          results: result.results,
          confidence: result.confidence,
          timestamp: Date.now()
        };
      } else {
        throw new Error(result.error || 'Voice search failed');
      }
    } catch (error) {
      throw new Error('Voice search error: ' + error);
    }
  }

  /**
   * Save voice note
   */
  private async saveVoiceNote(voiceNote: VoiceNote): Promise<void> {
    try {
      const savedNotes = await this.getSavedVoiceNotes();
      savedNotes.push(voiceNote);
      await AsyncStorage.setItem('voice_notes', JSON.stringify(savedNotes));
    } catch (error) {
      console.error('Error saving voice note:', error);
    }
  }

  /**
   * Get saved voice notes
   */
  public async getSavedVoiceNotes(): Promise<VoiceNote[]> {
    try {
      const stored = await AsyncStorage.getItem('voice_notes');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading voice notes:', error);
      return [];
    }
  }

  /**
   * Get voice note by ID
   */
  public async getVoiceNote(id: string): Promise<VoiceNote | null> {
    const notes = await this.getSavedVoiceNotes();
    return notes.find(note => note.id === id) || null;
  }

  /**
   * Update voice note
   */
  public async updateVoiceNote(voiceNote: VoiceNote): Promise<void> {
    try {
      const savedNotes = await this.getSavedVoiceNotes();
      const index = savedNotes.findIndex(note => note.id === voiceNote.id);
      
      if (index >= 0) {
        savedNotes[index] = voiceNote;
        await AsyncStorage.setItem('voice_notes', JSON.stringify(savedNotes));
      }
    } catch (error) {
      console.error('Error updating voice note:', error);
    }
  }

  /**
   * Delete voice note
   */
  public async deleteVoiceNote(id: string): Promise<void> {
    try {
      const voiceNote = await this.getVoiceNote(id);
      if (voiceNote) {
        // Delete audio file
        if (await RNFS.exists(voiceNote.audioPath)) {
          await RNFS.unlink(voiceNote.audioPath);
        }
      }

      const savedNotes = await this.getSavedVoiceNotes();
      const filteredNotes = savedNotes.filter(note => note.id !== id);
      await AsyncStorage.setItem('voice_notes', JSON.stringify(filteredNotes));
    } catch (error) {
      console.error('Error deleting voice note:', error);
    }
  }

  /**
   * Search voice notes
   */
  public async searchVoiceNotes(query: string): Promise<VoiceNote[]> {
    const notes = await this.getSavedVoiceNotes();
    const searchQuery = query.toLowerCase();
    
    return notes.filter(note => 
      note.title.toLowerCase().includes(searchQuery) ||
      note.transcription.toLowerCase().includes(searchQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery))
    );
  }

  /**
   * Get voice note statistics
   */
  public async getVoiceNoteStatistics(): Promise<{
    totalNotes: number;
    totalDuration: number;
    transcribedNotes: number;
    averageDuration: number;
    totalTranscriptionLength: number;
  }> {
    const notes = await this.getSavedVoiceNotes();
    
    const totalNotes = notes.length;
    const totalDuration = notes.reduce((total, note) => total + note.duration, 0);
    const transcribedNotes = notes.filter(note => note.isTranscribed).length;
    const averageDuration = totalNotes > 0 ? totalDuration / totalNotes : 0;
    const totalTranscriptionLength = notes.reduce((total, note) => total + note.transcription.length, 0);

    return {
      totalNotes,
      totalDuration,
      transcribedNotes,
      averageDuration,
      totalTranscriptionLength
    };
  }

  /**
   * Export voice note
   */
  public async exportVoiceNote(voiceNoteId: string, format: 'audio' | 'text' | 'both'): Promise<string> {
    const voiceNote = await this.getVoiceNote(voiceNoteId);
    if (!voiceNote) {
      throw new Error('Voice note not found');
    }

    const exportPath = RNFS.DocumentDirectoryPath + '/export_' + voiceNoteId + '_' + Date.now();
    
    if (format === 'audio' || format === 'both') {
      // Copy audio file
      const audioExportPath = exportPath + '.m4a';
      await RNFS.copyFile(voiceNote.audioPath, audioExportPath);
    }
    
    if (format === 'text' || format === 'both') {
      // Create text file
      const textExportPath = exportPath + '.txt';
      const textContent = `Title: ${voiceNote.title}\n\nTranscription:\n${voiceNote.transcription}\n\nCreated: ${new Date(voiceNote.createdAt).toLocaleString()}`;
      await RNFS.writeFile(textExportPath, textContent, 'utf8');
    }

    return exportPath;
  }

  /**
   * Get authentication token
   */
  private async getAuthToken(): Promise<string> {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    if (this.isRecording) {
      this.cancelRecording();
    }
  }
}

export default VoiceNoteService;







