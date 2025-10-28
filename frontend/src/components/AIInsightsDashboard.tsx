import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  LinearProgress,
  Alert,
  AlertTitle,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Info,
  AutoAwesome,
  Insights,
  Analytics,
  Assessment,
  Recommend,
  ThumbUp,
  ThumbDown,
  Close,
  ExpandMore,
  ExpandLess,
  Lightbulb,
  Security,
  AttachMoney,
  Schedule,
  Business
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const InsightCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
}));

const PriorityChip = styled(Chip)<{ priority: string }>(({ theme, priority }) => ({
  fontWeight: 'bold',
  ...(priority === 'critical' && {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  }),
  ...(priority === 'high' && {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  }),
  ...(priority === 'medium' && {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.info.contrastText,
  }),
  ...(priority === 'low' && {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  }),
}));

interface Insight {
  id: string;
  type: 'recommendation' | 'anomaly' | 'prediction' | 'alert';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  impact: number;
  category: string;
  actions: Action[];
  data?: any;
  createdAt: Date;
  expiresAt?: Date;
}

interface Action {
  id: string;
  title: string;
  description: string;
  type: 'button' | 'link' | 'form';
  url?: string;
  onClick?: () => void;
}

interface AIInsightsDashboardProps {
  userId: string;
  onInsightClick?: (insight: Insight) => void;
}

const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = ({ userId, onInsightClick }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [feedbackDialog, setFeedbackDialog] = useState<{ insight: Insight; open: boolean }>({
    insight: null as any,
    open: false
  });

  useEffect(() => {
    fetchInsights();
  }, [userId]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ai/insights/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInsightClick = (insight: Insight) => {
    setSelectedInsight(insight);
    if (onInsightClick) {
      onInsightClick(insight);
    }
  };

  const handleFeedback = async (insight: Insight, feedback: 'positive' | 'negative') => {
    try {
      await fetch(`/api/ai/insights/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          insightId: insight.id,
          feedback,
          userId
        })
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleDismissInsight = async (insightId: string) => {
    try {
      await fetch(`/api/ai/insights/dismiss/${insightId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setInsights(prev => prev.filter(insight => insight.id !== insightId));
    } catch (error) {
      console.error('Error dismissing insight:', error);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation':
        return <Recommend />;
      case 'anomaly':
        return <Warning />;
      case 'prediction':
        return <TrendingUp />;
      case 'alert':
        return <Security />;
      default:
        return <Insights />;
    }
  };

  const getInsightColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const renderInsightCard = (insight: Insight) => (
    <InsightCard key={insight.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: `${getInsightColor(insight.priority)}.main` }}>
              {getInsightIcon(insight.type)}
            </Avatar>
            <Box>
              <Typography variant="h6" component="h3">
                {insight.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {insight.category}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <PriorityChip 
              label={insight.priority.toUpperCase()} 
              size="small" 
              priority={insight.priority}
            />
            <IconButton 
              size="small" 
              onClick={() => handleDismissInsight(insight.id)}
            >
              <Close />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {insight.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="caption">Confidence</Typography>
            <LinearProgress 
              variant="determinate" 
              value={insight.confidence * 100} 
              sx={{ flex: 1 }}
            />
            <Typography variant="caption">
              {Math.round(insight.confidence * 100)}%
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption">Impact</Typography>
            <LinearProgress 
              variant="determinate" 
              value={insight.impact * 100} 
              color="secondary"
              sx={{ flex: 1 }}
            />
            <Typography variant="caption">
              {Math.round(insight.impact * 100)}%
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {insight.actions.slice(0, 2).map((action) => (
            <Button
              key={action.id}
              size="small"
              variant="outlined"
              onClick={action.onClick}
              startIcon={<AutoAwesome />}
            >
              {action.title}
            </Button>
          ))}
          {insight.actions.length > 2 && (
            <Button size="small" variant="text">
              +{insight.actions.length - 2} more
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Helpful">
              <IconButton 
                size="small" 
                onClick={() => handleFeedback(insight, 'positive')}
              >
                <ThumbUp fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Not helpful">
              <IconButton 
                size="small" 
                onClick={() => handleFeedback(insight, 'negative')}
              >
                <ThumbDown fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Button 
            size="small" 
            onClick={() => handleInsightClick(insight)}
            endIcon={<ExpandMore />}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </InsightCard>
  );

  const renderInsightDetails = (insight: Insight) => (
    <Dialog 
      open={!!selectedInsight} 
      onClose={() => setSelectedInsight(null)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: `${getInsightColor(insight.priority)}.main` }}>
            {getInsightIcon(insight.type)}
          </Avatar>
          <Box>
            <Typography variant="h6">{insight.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {insight.category} • {insight.priority} priority
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {insight.description}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Implementation Steps</Typography>
          <Stepper orientation="vertical">
            {insight.actions.map((action, index) => (
              <Step key={action.id} active>
                <StepLabel>{action.title}</StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={action.onClick}
                      sx={{ mr: 1 }}
                    >
                      {action.title}
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>

        {insight.data && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Supporting Data</Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                {JSON.stringify(insight.data, null, 2)}
              </pre>
            </Paper>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSelectedInsight(null)}>Close</Button>
        <Button 
          variant="contained" 
          onClick={() => {
            // Implement insight
            setSelectedInsight(null);
          }}
        >
          Implement
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const criticalInsights = insights.filter(i => i.priority === 'critical');
  const highInsights = insights.filter(i => i.priority === 'high');
  const mediumInsights = insights.filter(i => i.priority === 'medium');
  const lowInsights = insights.filter(i => i.priority === 'low');

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          AI Insights Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Personalized recommendations and insights powered by AI
        </Typography>
      </Box>

      {criticalInsights.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Critical Insights</AlertTitle>
          You have {criticalInsights.length} critical insights that require immediate attention.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              All Insights ({insights.length})
            </Typography>
            {insights.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <AutoAwesome sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No insights available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI is analyzing your data to generate personalized insights
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              insights.map(renderInsightCard)
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Insight Summary
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Warning color="error" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Critical" 
                    secondary={criticalInsights.length} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="High Priority" 
                    secondary={highInsights.length} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Info color="info" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Medium Priority" 
                    secondary={mediumInsights.length} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Low Priority" 
                    secondary={lowInsights.length} 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<Analytics />}
                sx={{ mb: 1 }}
              >
                View Analytics
              </Button>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<Assessment />}
                sx={{ mb: 1 }}
              >
                Generate Report
              </Button>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<Lightbulb />}
              >
                Get Recommendations
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {selectedInsight && renderInsightDetails(selectedInsight)}
    </Box>
  );
};

export default AIInsightsDashboard;










