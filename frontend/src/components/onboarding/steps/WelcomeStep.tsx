import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  Receipt as InvoiceIcon,
  Assessment as ReportIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon
} from '@mui/icons-material';

interface WelcomeStepProps {
  data: any;
  onChange: (data: any) => void;
  onComplete: () => void;
  onSkip: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onComplete }) => {
  const features = [
    {
      icon: <BankIcon color="primary" />,
      title: 'Banking Integration',
      description: 'Connect your bank accounts for automatic transaction import'
    },
    {
      icon: <InvoiceIcon color="primary" />,
      title: 'Smart Invoicing',
      description: 'Create professional invoices with automated follow-ups'
    },
    {
      icon: <ReportIcon color="primary" />,
      title: 'Financial Reports',
      description: 'Generate comprehensive financial reports and insights'
    },
    {
      icon: <SecurityIcon color="primary" />,
      title: 'Bank-Level Security',
      description: 'Your data is protected with enterprise-grade security'
    },
    {
      icon: <SpeedIcon color="primary" />,
      title: 'AI-Powered Automation',
      description: 'Smart categorization and expense tracking'
    },
    {
      icon: <SupportIcon color="primary" />,
      title: 'Expert Support',
      description: 'Get help from our team of bookkeeping experts'
    }
  ];

  return (
    <Box>
      <Box textAlign="center" mb={4}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            bgcolor: 'primary.main',
            fontSize: '2rem'
          }}
        >
          VG
        </Avatar>
        <Typography variant="h4" gutterBottom>
          Welcome to VeriGrade!
        </Typography>
        <Typography variant="h6" color="textSecondary" paragraph>
          Your comprehensive bookkeeping platform is ready to help you manage your business finances.
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Let's set up your account in just a few simple steps.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                    {feature.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box textAlign="center">
        <Button
          variant="contained"
          size="large"
          onClick={onComplete}
          sx={{ px: 4, py: 1.5 }}
        >
          Let's Get Started!
        </Button>
      </Box>
    </Box>
  );
};

export default WelcomeStep;







