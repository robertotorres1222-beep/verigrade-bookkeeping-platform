import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  IconButton, 
  Typography, 
  Chip, 
  CircularProgress,
  Avatar,
  Divider,
  Tooltip,
  Button,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { 
  Send, 
  Mic, 
  MicOff, 
  AttachFile, 
  SmartToy, 
  Person,
  VoiceChat,
  AutoAwesome,
  TrendingUp,
  Insights
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const ChatContainer = styled(Box)(({ theme }) => ({
  height: '600px',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

const MessageContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const MessageBubble = styled(Paper)<{ isUser: boolean }>(({ theme, isUser }) => ({
  padding: theme.spacing(1.5, 2),
  maxWidth: '80%',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  backgroundColor: isUser ? theme.palette.primary.main : theme.palette.grey[100],
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
  wordWrap: 'break-word',
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const SuggestionChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'chart' | 'table' | 'suggestion';
  data?: any;
  confidence?: number;
}

interface AIChatbotProps {
  userId: string;
  onClose?: () => void;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ userId, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const commonSuggestions = [
    "What's my cash flow for this month?",
    "Show me my top expenses",
    "Create an expense for $50 lunch",
    "What's my profit margin?",
    "Generate a financial report",
    "Help me categorize this transaction"
  ];

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        id: '1',
        text: "Hi! I'm your AI financial assistant. I can help you with expense entry, financial questions, and insights. What would you like to know?",
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      }
    ]);
    setSuggestions(commonSuggestions);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: text.trim(),
          userId: userId
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response.text,
          isUser: false,
          timestamp: new Date(),
          type: data.response.type || 'text',
          data: data.response.data,
          confidence: data.response.confidence
        };

        setMessages(prev => [...prev, aiMessage]);

        // Update suggestions based on response
        if (data.response.suggestions) {
          setSuggestions(data.response.suggestions);
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, I couldn't process that request. Please try again.",
          isUser: false,
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, there was an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    inputRef.current?.focus();
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      setIsRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append('userId', userId);

        try {
          const response = await fetch('/api/ai/chat/voice', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
          });

          const data = await response.json();
          if (data.success) {
            handleSendMessage(data.transcription);
          }
        } catch (error) {
          console.error('Error processing voice input:', error);
        }
      };

      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      }, 3000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsRecording(false);
    }
  };

  const renderMessage = (message: Message) => {
    if (message.type === 'chart' && message.data) {
      return (
        <Card sx={{ maxWidth: 400, alignSelf: message.isUser ? 'flex-end' : 'flex-start' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {message.data.title}
            </Typography>
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography>Chart visualization would go here</Typography>
            </Box>
          </CardContent>
        </Card>
      );
    }

    if (message.type === 'table' && message.data) {
      return (
        <Card sx={{ maxWidth: 500, alignSelf: message.isUser ? 'flex-end' : 'flex-start' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {message.data.title}
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {message.data.headers.map((header: string, index: number) => (
                      <th key={index} style={{ padding: '8px', border: '1px solid #ddd' }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {message.data.rows.map((row: any[], rowIndex: number) => (
                    <tr key={rowIndex}>
                      {row.map((cell: any, cellIndex: number) => (
                        <td key={cellIndex} style={{ padding: '8px', border: '1px solid #ddd' }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </CardContent>
        </Card>
      );
    }

    return (
      <MessageBubble isUser={message.isUser}>
        <Typography variant="body1">{message.text}</Typography>
        {message.confidence && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={message.confidence * 100} 
              sx={{ width: 60, mr: 1 }}
            />
            <Typography variant="caption">
              {Math.round(message.confidence * 100)}% confidence
            </Typography>
          </Box>
        )}
      </MessageBubble>
    );
  };

  return (
    <ChatContainer>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <SmartToy />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">AI Financial Assistant</Typography>
          <Typography variant="caption" color="text.secondary">
            Powered by advanced AI
          </Typography>
        </Box>
        {onClose && (
          <IconButton onClick={onClose} size="small">
            ×
          </IconButton>
        )}
      </Box>

      <MessageContainer>
        {messages.map((message) => (
          <Box key={message.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: message.isUser ? 'primary.main' : 'grey.500' }}>
              {message.isUser ? <Person /> : <SmartToy />}
            </Avatar>
            {renderMessage(message)}
          </Box>
        ))}
        
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: 'flex-start' }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.500' }}>
              <SmartToy />
            </Avatar>
            <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2">AI is thinking...</Typography>
            </Paper>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </MessageContainer>

      {suggestions.length > 0 && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Quick suggestions:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {suggestions.map((suggestion, index) => (
              <SuggestionChip
                key={index}
                label={suggestion}
                size="small"
                onClick={() => handleSuggestionClick(suggestion)}
                icon={<AutoAwesome />}
              />
            ))}
          </Box>
        </Box>
      )}

      <InputContainer component="form" onSubmit={handleSubmit}>
        <TextField
          ref={inputRef}
          fullWidth
          variant="outlined"
          placeholder="Ask me anything about your finances..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          size="small"
          InputProps={{
            endAdornment: (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Voice input">
                  <IconButton
                    size="small"
                    onClick={handleVoiceInput}
                    color={isRecording ? 'error' : 'default'}
                    disabled={isLoading}
                  >
                    {isRecording ? <MicOff /> : <Mic />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Attach file">
                  <IconButton size="small" disabled={isLoading}>
                    <AttachFile />
                  </IconButton>
                </Tooltip>
              </Box>
            )
          }}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={!inputText.trim() || isLoading}
          sx={{ ml: 1 }}
        >
          <Send />
        </IconButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default AIChatbot;






