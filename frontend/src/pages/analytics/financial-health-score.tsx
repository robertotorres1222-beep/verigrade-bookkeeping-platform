import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Info,
  Refresh,
  Download,
  Share
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { api } from '../../services/api';

interface FinancialHealthScore {
  overallScore: number;
  liquidity: {
    score: number;
    cashRunway: number;
    currentRatio: number;
    quickRatio: number;
  };
  growth: {
    score: number;
    mrrGrowth: number;
    customerGrowth: number;
    pipelineHealth: number;
  };
  profitability: {
    score: number;
    grossMargin: number;
    pathToBreakeven: number;
    burnMultiple: number;
  };
  efficiency: {
    score: number;
    cacPayback: number;
    magicNumber: number;
    ruleOf40: number;
  };
  retention: {
    score: number;
    grossRetention: number;
    netRetention: number;
    churnTrend: number;
  };
  peerComparison: {
    industryAverage: number;
    topQuartile: number;
    percentile: number;
  };
  recommendations: string[];
  lastUpdated: Date;
}

interface HealthScoreHistory {
  date: string;
  overallScore: number;
  liquidityScore: number;
  growthScore: number;
  profitabilityScore: number;
  efficiencyScore: number;
  retentionScore: number;
}

const FinancialHealthScore: React.FC = () => {
  const [healthScore, setHealthScore] = useState<FinancialHealthScore | null>(null);
  const [history, setHistory] = useState<HealthScoreHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealthScore();
    fetchHistory();
  }, []);

  const fetchHealthScore = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/financial-health-score/company-123');
      setHealthScore(response.data.data);
    } catch (error) {
      console.error('Error fetching health score:', error);
      setError('Failed to load financial health score');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get('/api/financial-health-score/company-123/history');
      setHistory(response.data.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#4caf50'; // Green
    if (score >= 70) return '#ff9800'; // Orange
    if (score >= 50) return '#ff5722'; // Red
    return '#f44336'; // Dark red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <CheckCircle />;
    if (score >= 50) return <Warning />;
    return <TrendingDown />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchHealthScore}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!healthScore) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">
          No financial health score data available.
        </Alert>
      </Container>
    );
  }

  const categoryData = [
    { name: 'Liquidity', score: healthScore.liquidity.score, color: '#2196f3' },
    { name: 'Growth', score: healthScore.growth.score, color: '#4caf50' },
    { name: 'Profitability', score: healthScore.profitability.score, color: '#ff9800' },
    { name: 'Efficiency', score: healthScore.efficiency.score, color: '#9c27b0' },
    { name: 'Retention', score: healthScore.retention.score, color: '#f44336' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Financial Health Score
        </Typography>
        <Box>
          <IconButton onClick={fetchHealthScore} color="primary">
            <Refresh />
          </IconButton>
          <IconButton color="primary">
            <Download />
          </IconButton>
          <IconButton color="primary">
            <Share />
          </IconButton>
        </Box>
      </Box>

      {/* Overall Score */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Typography variant="h6" component="h2" sx={{ mr: 2 }}>
              Overall Health Score
            </Typography>
            <Chip
              label={getScoreLabel(healthScore.overallScore)}
              color={healthScore.overallScore >= 70 ? 'success' : healthScore.overallScore >= 50 ? 'warning' : 'error'}
              icon={getScoreIcon(healthScore.overallScore)}
            />
          </Box>
          
          <Box display="flex" alignItems="center" mb={2}>
            <Typography variant="h2" component="div" sx={{ 
              color: getScoreColor(healthScore.overallScore),
              fontWeight: 'bold',
              mr: 2
            }}>
              {healthScore.overallScore}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              / 100
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={healthScore.overallScore}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getScoreColor(healthScore.overallScore),
                borderRadius: 5
              }
            }}
          />

          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="body2" color="text.secondary">
              Industry Average: {healthScore.peerComparison.industryAverage}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Top Quartile: {healthScore.peerComparison.topQuartile}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your Percentile: {healthScore.peerComparison.percentile}th
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {categoryData.map((category) => (
          <Grid item xs={12} sm={6} md={2.4} key={category.name}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {category.name}
                </Typography>
                <Box display="flex" alignItems="center" mb={1}>
                  <Typography variant="h4" sx={{ 
                    color: getScoreColor(category.score),
                    fontWeight: 'bold',
                    mr: 1
                  }}>
                    {category.score}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    / 100
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={category.score}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: category.color,
                      borderRadius: 3
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detailed Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Liquidity Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Liquidity Metrics
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Cash Runway</TableCell>
                      <TableCell align="right">
                        {Math.round(healthScore.liquidity.cashRunway)} months
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Current Ratio</TableCell>
                      <TableCell align="right">
                        {healthScore.liquidity.currentRatio.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Quick Ratio</TableCell>
                      <TableCell align="right">
                        {healthScore.liquidity.quickRatio.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Growth Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Growth Metrics
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>MRR Growth</TableCell>
                      <TableCell align="right">
                        {formatPercentage(healthScore.growth.mrrGrowth)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Customer Growth</TableCell>
                      <TableCell align="right">
                        {formatPercentage(healthScore.growth.customerGrowth)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Pipeline Health</TableCell>
                      <TableCell align="right">
                        {formatPercentage(healthScore.growth.pipelineHealth * 100)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Profitability Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profitability Metrics
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Gross Margin</TableCell>
                      <TableCell align="right">
                        {formatPercentage(healthScore.profitability.grossMargin)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Path to Breakeven</TableCell>
                      <TableCell align="right">
                        {healthScore.profitability.pathToBreakeven} months
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Burn Multiple</TableCell>
                      <TableCell align="right">
                        {healthScore.profitability.burnMultiple.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Efficiency Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Efficiency Metrics
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>CAC Payback</TableCell>
                      <TableCell align="right">
                        {healthScore.efficiency.cacPayback.toFixed(1)} months
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Magic Number</TableCell>
                      <TableCell align="right">
                        {healthScore.efficiency.magicNumber.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Rule of 40</TableCell>
                      <TableCell align="right">
                        {formatPercentage(healthScore.efficiency.ruleOf40)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Score History Chart */}
      {history.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Score History
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <RechartsTooltip />
                <Line 
                  type="monotone" 
                  dataKey="overallScore" 
                  stroke="#2196f3" 
                  strokeWidth={3}
                  name="Overall Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="liquidityScore" 
                  stroke="#4caf50" 
                  strokeWidth={2}
                  name="Liquidity"
                />
                <Line 
                  type="monotone" 
                  dataKey="growthScore" 
                  stroke="#ff9800" 
                  strokeWidth={2}
                  name="Growth"
                />
                <Line 
                  type="monotone" 
                  dataKey="profitabilityScore" 
                  stroke="#9c27b0" 
                  strokeWidth={2}
                  name="Profitability"
                />
                <Line 
                  type="monotone" 
                  dataKey="efficiencyScore" 
                  stroke="#f44336" 
                  strokeWidth={2}
                  name="Efficiency"
                />
                <Line 
                  type="monotone" 
                  dataKey="retentionScore" 
                  stroke="#607d8b" 
                  strokeWidth={2}
                  name="Retention"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recommendations
          </Typography>
          <List>
            {healthScore.recommendations.map((recommendation, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>
                    <Info color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={recommendation} />
                </ListItem>
                {index < healthScore.recommendations.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
};

export default FinancialHealthScore;





