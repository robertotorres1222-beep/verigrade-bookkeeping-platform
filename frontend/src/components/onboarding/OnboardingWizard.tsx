import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Box,
  Typography,
  LinearProgress,
  IconButton,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  SkipNext as SkipIcon,
  CheckCircle as CheckIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon
} from '@mui/icons-material';
import { useTourStore } from '../../services/tourService';
import WelcomeStep from './steps/WelcomeStep';
import CompanySetupStep from './steps/CompanySetupStep';
import ChartOfAccountsStep from './steps/ChartOfAccountsStep';
import BankAccountsStep from './steps/BankAccountsStep';
import ClientsStep from './steps/ClientsStep';
import CompletionStep from './steps/CompletionStep';

interface OnboardingWizardProps {
  open: boolean;
  onClose: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ open, onClose }) => {
  const {
    onboardingSession,
    onboardingSteps,
    isOnboardingActive,
    startOnboarding,
    completeOnboardingStep,
    skipOnboardingStep,
    completeOnboarding,
    resetOnboarding
  } = useTourStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<any>({});

  useEffect(() => {
    if (open && !isOnboardingActive) {
      startOnboarding('current-user'); // Replace with actual user ID
    }
  }, [open, isOnboardingActive, startOnboarding]);

  const handleNext = () => {
    const currentStepData = onboardingSteps[currentStep];
    if (currentStepData) {
      completeOnboardingStep(currentStepData.id, stepData[currentStepData.id]);
    }
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    const currentStepData = onboardingSteps[currentStep];
    if (currentStepData) {
      skipOnboardingStep(currentStepData.id);
    }
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
      onClose();
    }
  };

  const handleStepDataChange = (stepId: string, data: any) => {
    setStepData(prev => ({
      ...prev,
      [stepId]: data
    }));
  };

  const renderStepComponent = (step: any) => {
    const stepProps = {
      data: stepData[step.id] || {},
      onChange: (data: any) => handleStepDataChange(step.id, data),
      onComplete: () => handleNext(),
      onSkip: () => handleSkip()
    };

    switch (step.component) {
      case 'WelcomeStep':
        return <WelcomeStep {...stepProps} />;
      case 'CompanySetupStep':
        return <CompanySetupStep {...stepProps} />;
      case 'ChartOfAccountsStep':
        return <ChartOfAccountsStep {...stepProps} />;
      case 'BankAccountsStep':
        return <BankAccountsStep {...stepProps} />;
      case 'ClientsStep':
        return <ClientsStep {...stepProps} />;
      case 'CompletionStep':
        return <CompletionStep {...stepProps} />;
      default:
        return <Typography>Step not found</Typography>;
    }
  };

  const getProgress = () => {
    if (!onboardingSession) return 0;
    const totalSteps = onboardingSteps.length;
    const completedSteps = onboardingSession.completedSteps.length;
    return (completedSteps / totalSteps) * 100;
  };

  const isStepCompleted = (stepId: string) => {
    return onboardingSession?.completedSteps.includes(stepId) || false;
  };

  const isStepSkipped = (stepId: string) => {
    return onboardingSession?.skippedSteps.includes(stepId) || false;
  };

  const canProceed = () => {
    const currentStepData = onboardingSteps[currentStep];
    if (!currentStepData) return false;
    
    if (currentStepData.isRequired) {
      return isStepCompleted(currentStepData.id) || stepData[currentStepData.id];
    }
    
    return true;
  };

  if (!onboardingSession || !onboardingSteps.length) {
    return null;
  }

  const currentStepData = onboardingSteps[currentStep];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Getting Started</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <LinearProgress
              variant="determinate"
              value={getProgress()}
              sx={{ width: 100, mr: 2 }}
            />
            <Typography variant="body2" color="textSecondary">
              {onboardingSession.completedSteps.length} / {onboardingSteps.length}
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {onboardingSteps.map((step, index) => (
              <Step key={step.id}>
                <StepLabel
                  StepIconComponent={({ active, completed }) => {
                    if (completed || isStepCompleted(step.id)) {
                      return <CheckIcon color="success" />;
                    }
                    if (isStepSkipped(step.id)) {
                      return <SkipIcon color="disabled" />;
                    }
                    return null;
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={active ? 'bold' : 'normal'}>
                      {step.title}
                    </Typography>
                    {step.isRequired && (
                      <Chip label="Required" size="small" color="primary" />
                    )}
                  </Box>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ minHeight: '400px' }}>
          {currentStepData && (
            <Box>
              <Typography variant="h5" gutterBottom>
                {currentStepData.title}
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                {currentStepData.description}
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                {renderStepComponent(currentStepData)}
              </Box>
            </Box>
          )}
        </Box>

        <Box display="flex" justifyContent="space-between" sx={{ mt: 4 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={handleBack}
            disabled={currentStep === 0}
            variant="outlined"
          >
            Back
          </Button>
          
          <Box display="flex" gap={2}>
            {!currentStepData?.isRequired && (
              <Button
                startIcon={<SkipIcon />}
                onClick={handleSkip}
                variant="text"
                color="secondary"
              >
                Skip
              </Button>
            )}
            
            <Button
              endIcon={<ForwardIcon />}
              onClick={handleNext}
              disabled={!canProceed()}
              variant="contained"
            >
              {currentStep === onboardingSteps.length - 1 ? 'Complete' : 'Next'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWizard;







