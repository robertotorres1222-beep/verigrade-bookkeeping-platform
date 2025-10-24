import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Assessment,
  Psychology,
  Lightbulb,
  Refresh,
  Download,
  Share,
  ExpandMore,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { api } from '../../services/api';

interface PricingAnalysis {
  currentPricing: {
    plans: PricingPlan[];
    totalRevenue: number;
    averageRevenuePerUser: number;
  };
  willingnessToPay: {
    analysis: WTPAnalysis;
    recommendations: string[];
  };
  valueBasedPricing: {
    recommendations: ValueBasedRecommendation[];
    implementationSteps: string[];
  };
  annualDiscountOptimization: {
    currentDiscount: number;
    optimalDiscount: number;
    revenueImpact: number;
  };
  grandfatherPricingRisk: {
    riskLevel: 'low' | 'medium' | 'high';
    affectedRevenue: number;
    mitigationStrategies: string[];
  };
  usageBasedPricing: {
    currentUsage: UsageMetrics;
    recommendedPricing: UsageBasedPlan[];
    revenueProjection: number;
  };
  priceElasticity: {
    elasticity: number;
    optimalPrice: number;
    revenueImpact: number;
  };
  abTestRecommendations: {
    tests: ABTestRecommendation[];
    expectedImpact: number;
  };
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  userCount: number;
  revenue: number;
  churnRate: number;
  upgradeRate: number;
}

interface WTPAnalysis {
  overallWTP: number;
  bySegment: Array<{
    segment: string;
    wtp: number;
    confidence: number;
  }>;
  byFeature: Array<{
    feature: string;
    wtp: number;
    importance: number;
  }>;
  upgradeBehavior: {
    upgradeRate: number;
    averageUpgradeValue: number;
    commonUpgradePaths: string[];
  };
}

interface ValueBasedRecommendation {
  feature: string;
  currentValue: number;
  recommendedValue: number;
  justification: string;
  implementationEffort: 'low' | 'medium' | 'high';
}

interface UsageMetrics {
  totalUsers: number;
  activeUsers: number;
  averageUsage: number;
  usageDistribution: Array<{
    range: string;
    userCount: number;
    percentage: number;
  }>;
}

interface UsageBasedPlan {
  name: string;
  basePrice: number;
  usagePrice: number;
  includedUsage: number;
  projectedUsers: number;
  projectedRevenue: number;
}

interface ABTestRecommendation {
  testName: string;
  description: string;
  hypothesis: string;
  metrics: string[];
  duration: number;
  expectedImpact: number;
  riskLevel: 'low' | 'medium' | 'high';
}

const PricingAnalyzer: React.FC = () => {
  const [analysis, setAnalysis] = useState<PricingAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/pricing/company-123/analysis');
      setAnalysis(response.data.data);
    } catch (error) {
      console.error('Error fetching pricing analysis:', error);
      setError('Failed to load pricing analysis');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
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
          <Button color="inherit" size="small" onClick={fetchAnalysis}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!analysis) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">
          No pricing analysis data available.
        </Alert>
      </Container>
    );
  }

  const wtpData = analysis.willingnessToPay.analysis.bySegment.map(segment => ({
    segment: segment.segment,
    wtp: segment.wtp,
    confidence: segment.confidence * 100
  }));

  const featureData = analysis.willingnessToPay.analysis.byFeature.map(feature => ({
    feature: feature.feature,
    wtp: feature.wtp,
    importance: feature.importance * 100
  }));

  const usageData = analysis.usageBasedPricing.currentUsage.usageDistribution.map(usage => ({
    range: usage.range,
    users: usage.userCount,
    percentage: usage.percentage
  }));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Dynamic Pricing Analyzer
        </Typography>
        <Box>
          <IconButton onClick={fetchAnalysis} color="primary">
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

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AttachMoney color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Revenue</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatCurrency(analysis.currentPricing.totalRevenue)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ARPU: {formatCurrency(analysis.currentPricing.averageRevenuePerUser)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Psychology color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Willingness to Pay</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {formatCurrency(analysis.willingnessToPay.analysis.overallWTP)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                vs current pricing
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUp color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Price Elasticity</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {analysis.priceElasticity.elasticity.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Optimal: {formatCurrency(analysis.priceElasticity.optimalPrice)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Lightbulb color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Potential Impact</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {formatCurrency(analysis.priceElasticity.revenueImpact)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Revenue optimization
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Willingness to Pay" />
            <Tab label="Value-Based Pricing" />
            <Tab label="Usage-Based Pricing" />
            <Tab label="A/B Test Recommendations" />
            <Tab label="Risk Assessment" />
          </Tabs>
        </Box>

        {/* WTP Tab */}
        {activeTab === 0 && (
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  WTP by Segment
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={wtpData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="segment" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="wtp" fill="#4caf50" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  WTP by Feature
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={featureData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="wtp" fill="#2196f3" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  WTP Recommendations
                </Typography>
                <List>
                  {analysis.willingnessToPay.recommendations.map((recommendation, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText primary={recommendation} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </CardContent>
        )}

        {/* Value-Based Pricing Tab */}
        {activeTab === 1 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Value-Based Pricing Recommendations
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Feature</TableCell>
                    <TableCell align="right">Current Value</TableCell>
                    <TableCell align="right">Recommended Value</TableCell>
                    <TableCell>Effort</TableCell>
                    <TableCell>Justification</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analysis.valueBasedPricing.recommendations.map((rec, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {rec.feature}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(rec.currentValue)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          {formatCurrency(rec.recommendedValue)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rec.implementationEffort.toUpperCase()}
                          color={getEffortColor(rec.implementationEffort)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {rec.justification}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}

        {/* Usage-Based Pricing Tab */}
        {activeTab === 2 && (
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Current Usage Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={usageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="users"
                    >
                      {usageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Recommended Usage-Based Plans
                </Typography>
                <List>
                  {analysis.usageBasedPricing.recommendedPricing.map((plan, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={plan.name}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              Base: {formatCurrency(plan.basePrice)} + {formatCurrency(plan.usagePrice)}/unit
                            </Typography>
                            <Typography variant="body2">
                              Included: {plan.includedUsage.toLocaleString()} units
                            </Typography>
                            <Typography variant="body2" color="primary">
                              Projected Revenue: {formatCurrency(plan.projectedRevenue)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </CardContent>
        )}

        {/* A/B Test Recommendations Tab */}
        {activeTab === 3 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              A/B Test Recommendations
            </Typography>
            {analysis.abTestRecommendations.tests.map((test, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" alignItems="center" width="100%">
                    <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                      {test.testName}
                    </Typography>
                    <Box display="flex" gap={1} mr={2}>
                      <Chip
                        label={test.riskLevel.toUpperCase()}
                        color={getRiskColor(test.riskLevel)}
                        size="small"
                      />
                      <Typography variant="body2" color="success.main" fontWeight="bold">
                        +{test.expectedImpact * 100}% impact
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {test.description}
                      </Typography>
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Hypothesis
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {test.hypothesis}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Test Details
                      </Typography>
                      <Box mb={2}>
                        <Typography variant="body2">
                          Duration: {test.duration} days
                        </Typography>
                        <Typography variant="body2">
                          Expected Impact: +{(test.expectedImpact * 100).toFixed(1)}%
                        </Typography>
                        <Typography variant="body2">
                          Risk Level: {test.riskLevel.toUpperCase()}
                        </Typography>
                      </Box>
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Metrics to Track
                      </Typography>
                      <Box>
                        {test.metrics.map((metric, metricIndex) => (
                          <Chip
                            key={metricIndex}
                            label={metric}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        )}

        {/* Risk Assessment Tab */}
        {activeTab === 4 && (
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Grandfather Pricing Risk
                    </Typography>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Chip
                        label={analysis.grandfatherPricingRisk.riskLevel.toUpperCase()}
                        color={getRiskColor(analysis.grandfatherPricingRisk.riskLevel)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2">
                        Affected Revenue: {formatCurrency(analysis.grandfatherPricingRisk.affectedRevenue)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Mitigation Strategies
                    </Typography>
                    <List dense>
                      {analysis.grandfatherPricingRisk.mitigationStrategies.map((strategy, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Warning fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={strategy} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Annual Discount Optimization
                    </Typography>
                    <Box mb={2}>
                      <Typography variant="body2">
                        Current Discount: {analysis.annualDiscountOptimization.currentDiscount * 100}%
                      </Typography>
                      <Typography variant="body2">
                        Optimal Discount: {analysis.annualDiscountOptimization.optimalDiscount * 100}%
                      </Typography>
                      <Typography variant="body2" color="success.main" fontWeight="bold">
                        Revenue Impact: {formatCurrency(analysis.annualDiscountOptimization.revenueImpact)}
                      </Typography>
                    </Box>
                    
                    <LinearProgress
                      variant="determinate"
                      value={analysis.annualDiscountOptimization.optimalDiscount * 100}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Optimization Progress
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        )}
      </Card>
    </Container>
  );
};

export default PricingAnalyzer;





