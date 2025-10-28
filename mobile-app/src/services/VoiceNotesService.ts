import { PermissionsAndroid, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

export class VoiceNotesService {
  private audioRecorderPlayer: AudioRecorderPlayer;
  private isRecording: boolean = false;
  private recordingPath: string = '';

  constructor() {
    this.audioRecorderPlayer = new AudioRecorderPlayer();
  }

  async requestMicrophonePermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to microphone to record voice notes',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (error) {
      console.error('Failed to request microphone permission:', error);
      return false;
    }
  }

  async startRecording() {
    try {
      if (this.isRecording) {
        throw new Error('Recording is already in progress');
      }

      const hasPermission = await this.requestMicrophonePermission();
      if (!hasPermission) {
        throw new Error('Microphone permission not granted');
      }

      this.recordingPath = `voice_note_${Date.now()}.m4a`;
      
      const result = await this.audioRecorderPlayer.startRecorder(this.recordingPath);
      this.isRecording = true;

      return {
        success: true,
        recordingPath: this.recordingPath,
        message: 'Recording started'
      };
    } catch (error) {
      throw new Error(`Failed to start recording: ${error.message}`);
    }
  }

  async stopRecording() {
    try {
      if (!this.isRecording) {
        throw new Error('No active recording');
      }

      const result = await this.audioRecorderPlayer.stopRecorder();
      this.isRecording = false;

      return {
        success: true,
        recordingPath: this.recordingPath,
        duration: result,
        message: 'Recording stopped'
      };
    } catch (error) {
      throw new Error(`Failed to stop recording: ${error.message}`);
    }
  }

  async playRecording(recordingPath: string) {
    try {
      const result = await this.audioRecorderPlayer.startPlayer(recordingPath);
      return {
        success: true,
        message: 'Playback started'
      };
    } catch (error) {
      throw new Error(`Failed to play recording: ${error.message}`);
    }
  }

  async stopPlayback() {
    try {
      await this.audioRecorderPlayer.stopPlayer();
      return {
        success: true,
        message: 'Playback stopped'
      };
    } catch (error) {
      throw new Error(`Failed to stop playback: ${error.message}`);
    }
  }

  async pausePlayback() {
    try {
      await this.audioRecorderPlayer.pausePlayer();
      return {
        success: true,
        message: 'Playback paused'
      };
    } catch (error) {
      throw new Error(`Failed to pause playback: ${error.message}`);
    }
  }

  async resumePlayback() {
    try {
      await this.audioRecorderPlayer.resumePlayer();
      return {
        success: true,
        message: 'Playback resumed'
      };
    } catch (error) {
      throw new Error(`Failed to resume playback: ${error.message}`);
    }
  }

  async getRecordingDuration(recordingPath: string) {
    try {
      const duration = await this.audioRecorderPlayer.getDuration(recordingPath);
      return duration;
    } catch (error) {
      throw new Error(`Failed to get recording duration: ${error.message}`);
    }
  }

  async saveVoiceNote(recordingPath: string, metadata: any) {
    try {
      const voiceNote = {
        id: Date.now().toString(),
        recordingPath,
        duration: await this.getRecordingDuration(recordingPath),
        metadata,
        createdAt: new Date().toISOString()
      };

      // Save to local storage
      await this.saveVoiceNoteToStorage(voiceNote);

      return voiceNote;
    } catch (error) {
      throw new Error(`Failed to save voice note: ${error.message}`);
    }
  }

  async getVoiceNotes() {
    try {
      // This would typically use AsyncStorage
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Failed to get voice notes:', error);
      return [];
    }
  }

  private async saveVoiceNoteToStorage(voiceNote: any) {
    try {
      // This would typically use AsyncStorage
      // For now, just log
      console.log('Saving voice note:', voiceNote);
    } catch (error) {
      console.error('Failed to save voice note to storage:', error);
    }
  }

  async deleteVoiceNote(voiceNoteId: string) {
    try {
      const voiceNotes = await this.getVoiceNotes();
      const updatedNotes = voiceNotes.filter(note => note.id !== voiceNoteId);
      
      // Save updated notes to storage
      await this.saveVoiceNotesToStorage(updatedNotes);
      
      return {
        success: true,
        message: 'Voice note deleted'
      };
    } catch (error) {
      throw new Error(`Failed to delete voice note: ${error.message}`);
    }
  }

  private async saveVoiceNotesToStorage(voiceNotes: any[]) {
    try {
      // This would typically use AsyncStorage
      // For now, just log
      console.log('Saving voice notes:', voiceNotes);
    } catch (error) {
      console.error('Failed to save voice notes to storage:', error);
    }
  }

  async syncVoiceNotesWithBackend(voiceNotes: any[], token: string) {
    try {
      const response = await fetch('/api/voice-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ voiceNotes })
      });

      if (!response.ok) {
        throw new Error('Failed to sync voice notes with backend');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to sync voice notes: ${error.message}`);
    }
  }

  async transcribeVoiceNote(recordingPath: string) {
    try {
      // This would typically use a speech-to-text service
      // For now, return mock transcription
      return {
        success: true,
        transcription: 'This is a mock transcription of the voice note',
        confidence: 0.95
      };
    } catch (error) {
      throw new Error(`Failed to transcribe voice note: ${error.message}`);
    }
  }
}

export default new VoiceNotesService();










