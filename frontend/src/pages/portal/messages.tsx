import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Badge,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Grid
} from '@mui/material';
import {
  Message as MessageIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Reply as ReplyIcon,
  MarkAsUnread as MarkAsUnreadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface Message {
  id: string;
  subject: string;
  content: string;
  isRead: boolean;
  isUrgent: boolean;
  createdAt: string;
  fromUserId?: string;
  fromClientId?: string;
  attachments: Array<{
    id: string;
    name: string;
    fileUrl: string;
  }>;
}

const ClientMessages: React.FC = () => {
  const router = useRouter();
  const { clientId } = router.query;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    isUrgent: false
  });

  useEffect(() => {
    if (clientId) {
      fetchMessages();
    }
  }, [clientId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/client-portal/${clientId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    // Mark as read if not already
    if (!message.isRead) {
      markMessageAsRead(message.id);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/client-portal/${clientId}/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        // Update local state
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        ));
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleComposeMessage = () => {
    setNewMessage({
      subject: '',
      content: '',
      isUrgent: false
    });
    setComposeDialogOpen(true);
  };

  const handleReplyMessage = (message: Message) => {
    setNewMessage({
      subject: `Re: ${message.subject}`,
      content: '',
      isUrgent: false
    });
    setSelectedMessage(message);
    setReplyDialogOpen(true);
  };

  const sendMessage = async () => {
    try {
      const response = await fetch(`/api/client-portal/${clientId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMessage)
      });
      const data = await response.json();
      
      if (data.success) {
        setComposeDialogOpen(false);
        setReplyDialogOpen(false);
        setNewMessage({ subject: '', content: '', isUrgent: false });
        fetchMessages(); // Refresh messages
        alert('Message sent successfully!');
      } else {
        alert(`Failed to send message: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading messages...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Messages
        </Typography>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={handleComposeMessage}
        >
          Compose Message
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Messages List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inbox ({messages.filter(m => !m.isRead).length} unread)
              </Typography>
              <List>
                {messages.map((message) => (
                  <ListItem 
                    key={message.id}
                    button
                    onClick={() => handleViewMessage(message)}
                    sx={{
                      backgroundColor: message.isRead ? 'transparent' : 'action.hover',
                      borderLeft: message.isUrgent ? '4px solid' : 'none',
                      borderLeftColor: message.isUrgent ? 'error.main' : 'transparent'
                    }}
                  >
                    <ListItemIcon>
                      <Badge 
                        color="primary" 
                        variant="dot" 
                        invisible={message.isRead}
                      >
                        <MessageIcon />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography 
                            variant="body1" 
                            sx={{ fontWeight: message.isRead ? 'normal' : 'bold' }}
                          >
                            {message.subject}
                          </Typography>
                          {message.isUrgent && (
                            <Chip label="Urgent" color="error" size="small" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {message.content.substring(0, 100)}...
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(message.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Reply">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReplyMessage(message);
                          }}
                        >
                          <ReplyIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Message Content */}
        <Grid item xs={12} md={8}>
          {selectedMessage ? (
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    {selectedMessage.subject}
                  </Typography>
                  <Box>
                    {selectedMessage.isUrgent && (
                      <Chip label="Urgent" color="error" size="small" sx={{ mr: 1 }} />
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<ReplyIcon />}
                      onClick={() => handleReplyMessage(selectedMessage)}
                    >
                      Reply
                    </Button>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {formatDateTime(selectedMessage.createdAt)}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedMessage.content}
                </Typography>

                {selectedMessage.attachments.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Attachments
                    </Typography>
                    <List>
                      {selectedMessage.attachments.map((attachment) => (
                        <ListItem key={attachment.id}>
                          <ListItemIcon>
                            <AttachFileIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={attachment.name}
                            secondary={
                              <Button 
                                size="small" 
                                onClick={() => window.open(attachment.fileUrl, '_blank')}
                              >
                                Download
                              </Button>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </CardContent>
            </Card>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Select a message to view
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Choose a message from the list to read its content
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Compose Message Dialog */}
      <Dialog 
        open={composeDialogOpen} 
        onClose={() => setComposeDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Compose Message
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Subject"
              value={newMessage.subject}
              onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={6}
              value={newMessage.content}
              onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Box display="flex" alignItems="center">
              <input
                type="checkbox"
                id="urgent"
                checked={newMessage.isUrgent}
                onChange={(e) => setNewMessage({ ...newMessage, isUrgent: e.target.checked })}
              />
              <label htmlFor="urgent" style={{ marginLeft: 8 }}>
                Mark as urgent
              </label>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComposeDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={sendMessage}
            disabled={!newMessage.subject || !newMessage.content}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reply Message Dialog */}
      <Dialog 
        open={replyDialogOpen} 
        onClose={() => setReplyDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Reply to Message
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Subject"
              value={newMessage.subject}
              onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={6}
              value={newMessage.content}
              onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Box display="flex" alignItems="center">
              <input
                type="checkbox"
                id="urgent-reply"
                checked={newMessage.isUrgent}
                onChange={(e) => setNewMessage({ ...newMessage, isUrgent: e.target.checked })}
              />
              <label htmlFor="urgent-reply" style={{ marginLeft: 8 }}>
                Mark as urgent
              </label>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={sendMessage}
            disabled={!newMessage.subject || !newMessage.content}
          >
            Send Reply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientMessages;






