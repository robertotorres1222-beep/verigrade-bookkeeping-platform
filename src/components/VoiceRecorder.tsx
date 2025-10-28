'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Trash2, 
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Volume2
} from 'lucide-react';
import { toast } from 'sonner';

interface VoiceRecording {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  transcript: string;
  confidence: number;
  createdAt: Date;
  isProcessing: boolean;
}

interface VoiceRecorderProps {
  onTranscript?: (transcript: string) => void;
  onRecordingComplete?: (recording: VoiceRecording) => void;
  maxDuration?: number; // in seconds
  autoTranscribe?: boolean;
  className?: string;
}

export default function VoiceRecorder({
  onTranscript,
  onRecordingComplete,
  maxDuration = 300, // 5 minutes default
  autoTranscribe = true,
  className = ''
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
  const [currentRecording, setCurrentRecording] = useState<VoiceRecording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    checkSupport();
    return () => {
      cleanup();
    };
  }, []);

  const checkSupport = () => {
    if (typeof window !== 'undefined') {
      const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const hasMediaRecorder = !!window.MediaRecorder;
      const hasWebSpeechAPI = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      
      setIsSupported(hasGetUserMedia && hasMediaRecorder && hasWebSpeechAPI);
      
      if (!hasGetUserMedia) {
        setError('Microphone access is not supported in this browser');
      } else if (!hasMediaRecorder) {
        setError('Audio recording is not supported in this browser');
      } else if (!hasWebSpeechAPI) {
        setError('Speech recognition is not supported in this browser');
      }
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const recording: VoiceRecording = {
          id: `recording_${Date.now()}`,
          blob: audioBlob,
          url: audioUrl,
          duration: recordingDuration,
          transcript: '',
          confidence: 0,
          createdAt: new Date(),
          isProcessing: false
        };
        
        setCurrentRecording(recording);
        setRecordings(prev => [recording, ...prev]);
        
        if (autoTranscribe) {
          transcribeRecording(recording);
        }
        
        if (onRecordingComplete) {
          onRecordingComplete(recording);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start duration timer
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording. Please check microphone permissions.');
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const transcribeRecording = async (recording: VoiceRecording) => {
    try {
      setRecordings(prev => prev.map(r => 
        r.id === recording.id ? { ...r, isProcessing: true } : r
      ));
      
      // Simulate speech-to-text processing
      // In a real implementation, you would use Web Speech API or a cloud service
      const transcript = await simulateSpeechToText(recording.blob);
      
      setRecordings(prev => prev.map(r => 
        r.id === recording.id ? { 
          ...r, 
          transcript, 
          confidence: 0.85,
          isProcessing: false 
        } : r
      ));
      
      if (onTranscript) {
        onTranscript(transcript);
      }
      
      toast.success('Recording transcribed successfully');
      
    } catch (error) {
      console.error('Error transcribing recording:', error);
      setRecordings(prev => prev.map(r => 
        r.id === recording.id ? { ...r, isProcessing: false } : r
      ));
      toast.error('Failed to transcribe recording');
    }
  };

  const simulateSpeechToText = async (blob: Blob): Promise<string> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock transcription results
    const mockTranscripts = [
      'This is a sample transcription of the voice recording.',
      'I need to record this expense for office supplies.',
      'Client meeting scheduled for next Tuesday at 2 PM.',
      'Please process this invoice for ABC Company.',
      'Travel expense for business trip to New York.',
    ];
    
    return mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
  };

  const playRecording = (recording: VoiceRecording) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audio = new Audio(recording.url);
    audioRef.current = audio;
    
    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => setIsPlaying(false);
    
    audio.play();
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const deleteRecording = (recordingId: string) => {
    setRecordings(prev => prev.filter(r => r.id !== recordingId));
    
    if (currentRecording?.id === recordingId) {
      setCurrentRecording(null);
    }
    
    toast.success('Recording deleted');
  };

  const downloadRecording = (recording: VoiceRecording) => {
    const link = document.createElement('a');
    link.href = recording.url;
    link.download = `recording_${recording.id}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  if (!isSupported) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Voice recording is not supported in this browser. Please use a modern browser with microphone access.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mic className="h-5 w-5" />
            <span>Voice Recorder</span>
          </CardTitle>
          <CardDescription>
            Record voice notes and get automatic transcription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Recording Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {isRecording ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-red-600 font-medium">Recording</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full" />
                      <span className="text-gray-600">Ready</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {formatDuration(recordingDuration)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? "destructive" : "default"}
                  disabled={recordingDuration >= maxDuration}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Record
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            {isRecording && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(recordingDuration / maxDuration) * 100}%` }}
                />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Recording */}
      {currentRecording && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Volume2 className="h-5 w-5" />
              <span>Current Recording</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => playRecording(currentRecording)}
                      disabled={isPlaying}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Play
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={pauseRecording}
                      disabled={!isPlaying}
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {formatDuration(currentRecording.duration)}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadRecording(currentRecording)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteRecording(currentRecording.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Transcript */}
              {currentRecording.transcript && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Transcribed</span>
                    <Badge variant="outline">
                      {Math.round(currentRecording.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{currentRecording.transcript}</p>
                  </div>
                </div>
              )}

              {currentRecording.isProcessing && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  <span className="text-sm text-gray-600">Processing transcription...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recording History */}
      {recordings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recording History</CardTitle>
            <CardDescription>
              {recordings.length} recording{recordings.length !== 1 ? 's' : ''} saved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recordings.slice(0, 5).map((recording) => (
                <div key={recording.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => playRecording(recording)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {formatDuration(recording.duration)}
                        </span>
                        {recording.transcript && (
                          <Badge variant="outline" className="text-xs">
                            Transcribed
                          </Badge>
                        )}
                        {recording.isProcessing && (
                          <Badge variant="outline" className="text-xs">
                            Processing
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {recording.createdAt.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadRecording(recording)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteRecording(recording.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

