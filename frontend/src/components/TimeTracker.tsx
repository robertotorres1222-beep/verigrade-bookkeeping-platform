import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Tooltip,
  Fade,
  Zoom,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Timer,
  Assignment,
  Person,
  AttachMoney,
  Edit,
  Save,
  Cancel,
  Delete,
  Add,
  History,
  TrendingUp,
  AccessTime,
  CheckCircle,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { format, differenceInSeconds, addSeconds } from 'date-fns';

const TimerCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
}));

const TimerDisplay = styled(Box)(({ theme }) => ({
  fontSize: '3rem',
  fontWeight: 'bold',
  textAlign: 'center',
  margin: theme.spacing(2, 0),
  fontFamily: 'monospace',
  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
}));

const ControlButton = styled(Button)(({ theme }) => ({
  minWidth: 120,
  height: 48,
  borderRadius: 24,
  fontSize: '1.1rem',
  fontWeight: 'bold',
  textTransform: 'none',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
  },
}));

interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  task: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  isBillable: boolean;
  hourlyRate?: number;
  status: 'running' | 'paused' | 'stopped';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Project {
  id: string;
  name: string;
  client: string;
  hourlyRate: number;
  budget: number;
  spent: number;
  isActive: boolean;
  color: string;
}

interface TimeTrackerProps {
  projects: Project[];
  onTimeEntrySave: (entry: TimeEntry) => void;
  onTimeEntryUpdate: (entry: TimeEntry) => void;
  onTimeEntryDelete: (id: string) => void;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({
  projects,
  onTimeEntrySave,
  onTimeEntryUpdate,
  onTimeEntryDelete,
}) => {
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [isBillable, setIsBillable] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const now = new Date();
          const elapsed = differenceInSeconds(now, startTimeRef.current) + pausedTimeRef.current;
          setElapsedTime(elapsed);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer
  const handleStart = useCallback(() => {
    if (!selectedProject) {
      setSnackbar({ open: true, message: 'Please select a project first', severity: 'warning' });
      return;
    }

    if (!task.trim()) {
      setSnackbar({ open: true, message: 'Please enter a task description', severity: 'warning' });
      return;
    }

    const now = new Date();
    const newEntry: TimeEntry = {
      id: `entry_${Date.now()}`,
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      task: task.trim(),
      description: description.trim(),
      startTime: now,
      duration: 0,
      isBillable,
      hourlyRate: selectedProject.hourlyRate,
      status: 'running',
      tags,
      createdAt: now,
      updatedAt: now,
    };

    setCurrentEntry(newEntry);
    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = now;
    pausedTimeRef.current = 0;
    setElapsedTime(0);

    setSnackbar({ open: true, message: 'Timer started', severity: 'success' });
  }, [selectedProject, task, description, isBillable, tags]);

  // Pause timer
  const handlePause = useCallback(() => {
    if (isPaused) {
      // Resume
      setIsPaused(false);
      startTimeRef.current = new Date();
      setSnackbar({ open: true, message: 'Timer resumed', severity: 'info' });
    } else {
      // Pause
      setIsPaused(true);
      if (currentEntry) {
        const updatedEntry = {
          ...currentEntry,
          duration: elapsedTime,
          status: 'paused' as const,
          updatedAt: new Date(),
        };
        setCurrentEntry(updatedEntry);
        onTimeEntryUpdate(updatedEntry);
      }
      setSnackbar({ open: true, message: 'Timer paused', severity: 'info' });
    }
  }, [isPaused, currentEntry, elapsedTime, onTimeEntryUpdate]);

  // Stop timer
  const handleStop = useCallback(() => {
    if (!currentEntry) return;

    const now = new Date();
    const finalEntry: TimeEntry = {
      ...currentEntry,
      endTime: now,
      duration: elapsedTime,
      status: 'stopped',
      updatedAt: now,
    };

    setCurrentEntry(null);
    setIsRunning(false);
    setIsPaused(false);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    setElapsedTime(0);

    onTimeEntrySave(finalEntry);
    setSnackbar({ open: true, message: 'Time entry saved', severity: 'success' });
  }, [currentEntry, elapsedTime, onTimeEntrySave]);

  // Reset timer
  const handleReset = useCallback(() => {
    setCurrentEntry(null);
    setIsRunning(false);
    setIsPaused(false);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    setElapsedTime(0);
    setTask('');
    setDescription('');
    setTags([]);
  }, []);

  // Calculate billable amount
  const calculateBillableAmount = (): number => {
    if (!currentEntry || !currentEntry.hourlyRate) return 0;
    return (elapsedTime / 3600) * currentEntry.hourlyRate;
  };

  // Get project progress
  const getProjectProgress = (project: Project): number => {
    if (project.budget === 0) return 0;
    return Math.min((project.spent / project.budget) * 100, 100);
  };

  // Get project status color
  const getProjectStatusColor = (project: Project): string => {
    const progress = getProjectProgress(project);
    if (progress >= 100) return '#f44336'; // Red
    if (progress >= 80) return '#ff9800'; // Orange
    if (progress >= 60) return '#ffc107'; // Yellow
    return '#4caf50'; // Green
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {/* Timer Display */}
      <TimerCard elevation={8}>
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timer />
              Time Tracker
            </Typography>
            {currentEntry && (
              <Chip
                label={currentEntry.projectName}
                color="primary"
                variant="outlined"
                sx={{ color: 'white', borderColor: 'white' }}
              />
            )}
          </Box>

          <TimerDisplay>
            {formatTime(elapsedTime)}
          </TimerDisplay>

          {currentEntry && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {currentEntry.task}
              </Typography>
              {currentEntry.description && (
                <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
                  {currentEntry.description}
                </Typography>
              )}
              {currentEntry.isBillable && currentEntry.hourlyRate && (
                <Typography variant="h6" sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <AttachMoney />
                  ${calculateBillableAmount().toFixed(2)}
                </Typography>
              )}
            </Box>
          )}

          {/* Control Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            {!isRunning ? (
              <ControlButton
                variant="contained"
                color="success"
                startIcon={<PlayArrow />}
                onClick={handleStart}
                disabled={!selectedProject || !task.trim()}
                sx={{ bgcolor: '#4caf50' }}
              >
                Start
              </ControlButton>
            ) : (
              <>
                <ControlButton
                  variant="contained"
                  color={isPaused ? 'success' : 'warning'}
                  startIcon={isPaused ? <PlayArrow /> : <Pause />}
                  onClick={handlePause}
                  sx={{ bgcolor: isPaused ? '#4caf50' : '#ff9800' }}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </ControlButton>
                <ControlButton
                  variant="contained"
                  color="error"
                  startIcon={<Stop />}
                  onClick={handleStop}
                  sx={{ bgcolor: '#f44336' }}
                >
                  Stop
                </ControlButton>
              </>
            )}
            
            {currentEntry && (
              <ControlButton
                variant="outlined"
                color="inherit"
                startIcon={<Edit />}
                onClick={() => setShowEntryDialog(true)}
                sx={{ color: 'white', borderColor: 'white' }}
              >
                Edit
              </ControlButton>
            )}
            
            <ControlButton
              variant="outlined"
              color="inherit"
              startIcon={<Add />}
              onClick={() => setShowProjectDialog(true)}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              New Project
            </ControlButton>
          </Box>
        </CardContent>
      </TimerCard>

      {/* Project Selection */}
      {!currentEntry && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Select Project
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {projects.map((project) => (
                <Chip
                  key={project.id}
                  label={project.name}
                  onClick={() => setSelectedProject(project)}
                  color={selectedProject?.id === project.id ? 'primary' : 'default'}
                  variant={selectedProject?.id === project.id ? 'filled' : 'outlined'}
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>

            {selectedProject && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Task Description"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="What are you working on?"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Description (Optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={2}
                  placeholder="Additional details..."
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isBillable}
                        onChange={(e) => setIsBillable(e.target.checked)}
                      />
                    }
                    label="Billable"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Rate: ${selectedProject.hourlyRate}/hour
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Project Progress */}
      {selectedProject && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Project Progress
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                {selectedProject.name}
              </Typography>
              <Typography variant="body2">
                ${selectedProject.spent.toFixed(2)} / ${selectedProject.budget.toFixed(2)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={getProjectProgress(selectedProject)}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getProjectStatusColor(selectedProject),
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {getProjectProgress(selectedProject).toFixed(1)}% of budget used
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TimeTracker;






