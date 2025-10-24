import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert
} from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';

interface CompanySetupStepProps {
  data: any;
  onChange: (data: any) => void;
  onComplete: () => void;
  onSkip: () => void;
}

const CompanySetupStep: React.FC<CompanySetupStepProps> = ({ data, onChange, onComplete }) => {
  const [formData, setFormData] = useState({
    companyName: data.companyName || '',
    businessType: data.businessType || '',
    industry: data.industry || '',
    taxId: data.taxId || '',
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    zipCode: data.zipCode || '',
    country: data.country || 'US',
    phone: data.phone || '',
    email: data.email || '',
    website: data.website || '',
    fiscalYearStart: data.fiscalYearStart || 'January',
    currency: data.currency || 'USD',
    timezone: data.timezone || 'America/New_York',
    hasEmployees: data.hasEmployees || false,
    estimatedRevenue: data.estimatedRevenue || '',
    ...data
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    
    if (!formData.businessType) {
      newErrors.businessType = 'Business type is required';
    }
    
    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = () => {
    if (validateForm()) {
      onComplete();
    }
  };

  const businessTypes = [
    'Sole Proprietorship',
    'Partnership',
    'LLC',
    'Corporation',
    'S-Corporation',
    'Non-Profit',
    'Other'
  ];

  const industries = [
    'Professional Services',
    'Retail',
    'Manufacturing',
    'Technology',
    'Healthcare',
    'Real Estate',
    'Construction',
    'Food & Beverage',
    'Consulting',
    'Other'
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' }
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <BusinessIcon color="primary" sx={{ mr: 2 }} />
        <Typography variant="h5">Company Information</Typography>
      </Box>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Tell us about your business so we can customize your experience.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Company Name"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            error={!!errors.companyName}
            helperText={errors.companyName}
            required
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required error={!!errors.businessType}>
            <InputLabel>Business Type</InputLabel>
            <Select
              value={formData.businessType}
              onChange={(e) => handleChange('businessType', e.target.value)}
              label="Business Type"
            >
              {businessTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required error={!!errors.industry}>
            <InputLabel>Industry</InputLabel>
            <Select
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              label="Industry"
            >
              {industries.map((industry) => (
                <MenuItem key={industry} value={industry}>
                  {industry}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Tax ID (EIN)"
            value={formData.taxId}
            onChange={(e) => handleChange('taxId', e.target.value)}
            placeholder="XX-XXXXXXX"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Business Address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            error={!!errors.address}
            helperText={errors.address}
            required
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="City"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            error={!!errors.city}
            helperText={errors.city}
            required
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="State/Province"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
            error={!!errors.state}
            helperText={errors.state}
            required
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="ZIP/Postal Code"
            value={formData.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            error={!!errors.zipCode}
            helperText={errors.zipCode}
            required
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Website"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              label="Currency"
            >
              {currencies.map((currency) => (
                <MenuItem key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.hasEmployees}
                onChange={(e) => handleChange('hasEmployees', e.target.checked)}
              />
            }
            label="I have employees (for payroll features)"
          />
        </Grid>
      </Grid>

      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Please fill in all required fields to continue.
        </Alert>
      )}

      <Box display="flex" justifyContent="flex-end" mt={3}>
        <Button
          variant="contained"
          onClick={handleComplete}
          disabled={Object.keys(errors).length > 0}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
};

export default CompanySetupStep;







