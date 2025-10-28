import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    type: 'click' | 'navigate' | 'input' | 'wait';
    selector?: string;
    value?: string;
    url?: string;
    delay?: number;
  };
  highlight?: boolean;
  skipable?: boolean;
  order: number;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  steps: TourStep[];
  isActive: boolean;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  isCompleted: boolean;
  isRequired: boolean;
  order: number;
  data?: any;
}

export interface OnboardingSession {
  id: string;
  userId: string;
  currentStep: number;
  isCompleted: boolean;
  completedSteps: string[];
  skippedSteps: string[];
  startedAt: Date;
  completedAt?: Date;
  data: any;
}

interface TourState {
  // Tours
  tours: Tour[];
  activeTour: Tour | null;
  currentStep: number;
  isTourActive: boolean;
  
  // Onboarding
  onboardingSession: OnboardingSession | null;
  onboardingSteps: OnboardingStep[];
  isOnboardingActive: boolean;
  
  // Help system
  helpArticles: Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    isPublished: boolean;
  }>;
  
  // Actions
  startTour: (tourId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeTour: () => void;
  skipTour: () => void;
  startOnboarding: (userId: string) => void;
  completeOnboardingStep: (stepId: string, data?: any) => void;
  skipOnboardingStep: (stepId: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  addHelpArticle: (article: any) => void;
  searchHelp: (query: string) => any[];
}

export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      // Initial state
      tours: [],
      activeTour: null,
      currentStep: 0,
      isTourActive: false,
      onboardingSession: null,
      onboardingSteps: [],
      isOnboardingActive: false,
      helpArticles: [],

      // Tour actions
      startTour: (tourId: string) => {
        const tour = get().tours.find(t => t.id === tourId);
        if (tour) {
          set({
            activeTour: tour,
            currentStep: 0,
            isTourActive: true
          });
        }
      },

      nextStep: () => {
        const { activeTour, currentStep } = get();
        if (activeTour && currentStep < activeTour.steps.length - 1) {
          set({ currentStep: currentStep + 1 });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
        }
      },

      completeTour: () => {
        const { activeTour } = get();
        if (activeTour) {
          set({
            isTourActive: false,
            activeTour: null,
            currentStep: 0
          });
          
          // Mark tour as completed
          set(state => ({
            tours: state.tours.map(tour => 
              tour.id === activeTour.id 
                ? { ...tour, isCompleted: true, completedAt: new Date() }
                : tour
            )
          }));
        }
      },

      skipTour: () => {
        set({
          isTourActive: false,
          activeTour: null,
          currentStep: 0
        });
      },

      // Onboarding actions
      startOnboarding: (userId: string) => {
        const session: OnboardingSession = {
          id: `onboarding-${Date.now()}`,
          userId,
          currentStep: 0,
          isCompleted: false,
          completedSteps: [],
          skippedSteps: [],
          startedAt: new Date(),
          data: {}
        };
        
        set({
          onboardingSession: session,
          isOnboardingActive: true
        });
      },

      completeOnboardingStep: (stepId: string, data?: any) => {
        const { onboardingSession } = get();
        if (onboardingSession) {
          const updatedSession = {
            ...onboardingSession,
            completedSteps: [...onboardingSession.completedSteps, stepId],
            data: { ...onboardingSession.data, [stepId]: data }
          };
          
          set({
            onboardingSession: updatedSession,
            onboardingSteps: get().onboardingSteps.map(step =>
              step.id === stepId ? { ...step, isCompleted: true } : step
            )
          });
        }
      },

      skipOnboardingStep: (stepId: string) => {
        const { onboardingSession } = get();
        if (onboardingSession) {
          const updatedSession = {
            ...onboardingSession,
            skippedSteps: [...onboardingSession.skippedSteps, stepId]
          };
          
          set({ onboardingSession: updatedSession });
        }
      },

      completeOnboarding: () => {
        const { onboardingSession } = get();
        if (onboardingSession) {
          const updatedSession = {
            ...onboardingSession,
            isCompleted: true,
            completedAt: new Date()
          };
          
          set({
            onboardingSession: updatedSession,
            isOnboardingActive: false
          });
        }
      },

      resetOnboarding: () => {
        set({
          onboardingSession: null,
          onboardingSteps: [],
          isOnboardingActive: false
        });
      },

      addHelpArticle: (article: any) => {
        set(state => ({
          helpArticles: [...state.helpArticles, article]
        }));
      },

      searchHelp: (query: string) => {
        const { helpArticles } = get();
        const lowercaseQuery = query.toLowerCase();
        
        return helpArticles.filter(article => 
          article.isPublished && (
            article.title.toLowerCase().includes(lowercaseQuery) ||
            article.content.toLowerCase().includes(lowercaseQuery) ||
            article.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
          )
        );
      }
    }),
    {
      name: 'tour-storage',
      partialize: (state) => ({
        tours: state.tours,
        onboardingSession: state.onboardingSession,
        onboardingSteps: state.onboardingSteps
      })
    }
  )
);

// Predefined tours
export const defaultTours: Tour[] = [
  {
    id: 'dashboard-tour',
    name: 'Dashboard Overview',
    description: 'Learn how to navigate the main dashboard',
    isActive: false,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    steps: [
      {
        id: 'dashboard-welcome',
        target: '[data-tour="dashboard-welcome"]',
        title: 'Welcome to VeriGrade!',
        content: 'This is your main dashboard where you can see an overview of your business finances.',
        placement: 'center',
        highlight: true,
        skipable: true,
        order: 1
      },
      {
        id: 'dashboard-summary',
        target: '[data-tour="dashboard-summary"]',
        title: 'Financial Summary',
        content: 'Here you can see your total revenue, expenses, and profit for the current period.',
        placement: 'bottom',
        highlight: true,
        skipable: true,
        order: 2
      },
      {
        id: 'dashboard-charts',
        target: '[data-tour="dashboard-charts"]',
        title: 'Financial Charts',
        content: 'Visualize your financial data with interactive charts and graphs.',
        placement: 'top',
        highlight: true,
        skipable: true,
        order: 3
      },
      {
        id: 'dashboard-recent',
        target: '[data-tour="dashboard-recent"]',
        title: 'Recent Activity',
        content: 'View your most recent transactions and activities here.',
        placement: 'left',
        highlight: true,
        skipable: true,
        order: 4
      }
    ]
  },
  {
    id: 'invoicing-tour',
    name: 'Invoicing System',
    description: 'Learn how to create and manage invoices',
    isActive: false,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    steps: [
      {
        id: 'invoices-list',
        target: '[data-tour="invoices-list"]',
        title: 'Invoice Management',
        content: 'This is where you can view, create, and manage all your invoices.',
        placement: 'bottom',
        highlight: true,
        skipable: true,
        order: 1
      },
      {
        id: 'create-invoice',
        target: '[data-tour="create-invoice"]',
        title: 'Create New Invoice',
        content: 'Click here to create a new invoice for your clients.',
        placement: 'right',
        highlight: true,
        skipable: true,
        order: 2
      },
      {
        id: 'invoice-templates',
        target: '[data-tour="invoice-templates"]',
        title: 'Invoice Templates',
        content: 'Use templates to quickly create invoices with pre-filled information.',
        placement: 'top',
        highlight: true,
        skipable: true,
        order: 3
      }
    ]
  },
  {
    id: 'banking-tour',
    name: 'Banking Features',
    description: 'Learn how to manage your bank accounts and transactions',
    isActive: false,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    steps: [
      {
        id: 'banking-dashboard',
        target: '[data-tour="banking-dashboard"]',
        title: 'Banking Dashboard',
        content: 'Manage all your bank accounts and view transaction summaries here.',
        placement: 'bottom',
        highlight: true,
        skipable: true,
        order: 1
      },
      {
        id: 'account-sync',
        target: '[data-tour="account-sync"]',
        title: 'Account Synchronization',
        content: 'Sync your bank accounts to automatically import transactions.',
        placement: 'right',
        highlight: true,
        skipable: true,
        order: 2
      },
      {
        id: 'reconciliation',
        target: '[data-tour="reconciliation"]',
        title: 'Bank Reconciliation',
        content: 'Reconcile your bank transactions with your bookkeeping records.',
        placement: 'top',
        highlight: true,
        skipable: true,
        order: 3
      }
    ]
  }
];

// Predefined onboarding steps
export const defaultOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to VeriGrade',
    description: 'Let\'s get you set up with your bookkeeping platform',
    component: 'WelcomeStep',
    isCompleted: false,
    isRequired: true,
    order: 1
  },
  {
    id: 'company-setup',
    title: 'Company Information',
    description: 'Tell us about your business',
    component: 'CompanySetupStep',
    isCompleted: false,
    isRequired: true,
    order: 2
  },
  {
    id: 'chart-of-accounts',
    title: 'Chart of Accounts',
    description: 'Set up your accounting categories',
    component: 'ChartOfAccountsStep',
    isCompleted: false,
    isRequired: true,
    order: 3
  },
  {
    id: 'bank-accounts',
    title: 'Bank Accounts',
    description: 'Connect your bank accounts',
    component: 'BankAccountsStep',
    isCompleted: false,
    isRequired: false,
    order: 4
  },
  {
    id: 'clients',
    title: 'Clients',
    description: 'Add your first client',
    component: 'ClientsStep',
    isCompleted: false,
    isRequired: false,
    order: 5
  },
  {
    id: 'completion',
    title: 'Setup Complete',
    description: 'You\'re all set! Let\'s explore the platform',
    component: 'CompletionStep',
    isCompleted: false,
    isRequired: true,
    order: 6
  }
];

// Initialize default data
export const initializeTourService = () => {
  const store = useTourStore.getState();
  
  if (store.tours.length === 0) {
    useTourStore.setState({ tours: defaultTours });
  }
  
  if (store.onboardingSteps.length === 0) {
    useTourStore.setState({ onboardingSteps: defaultOnboardingSteps });
  }
};










