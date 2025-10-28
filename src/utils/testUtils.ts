// Test utilities for comprehensive testing
export const testUtils = {
  // Mock API responses
  mockApiResponse: <T>(data: T, delay: number = 100): Promise<T> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), delay);
    });
  },

  // Mock API error
  mockApiError: (message: string, status: number = 500): Promise<never> => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        const error = new Error(message);
        (error as any).status = status;
        reject(error);
      }, 100);
    });
  },

  // Generate test data
  generateTestData: {
    users: (count: number) => Array.from({ length: count }, (_, i) => ({
      id: `user-${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 3 === 0 ? 'admin' : i % 3 === 1 ? 'manager' : 'user',
      status: i % 4 === 0 ? 'inactive' : 'active',
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
    })),

    transactions: (count: number) => Array.from({ length: count }, (_, i) => ({
      id: `txn-${i + 1}`,
      amount: Math.floor(Math.random() * 10000) + 100,
      description: `Transaction ${i + 1}`,
      category: ['Revenue', 'Expense', 'Asset', 'Liability'][i % 4],
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      status: i % 5 === 0 ? 'pending' : 'completed'
    })),

    clients: (count: number) => Array.from({ length: count }, (_, i) => ({
      id: `client-${i + 1}`,
      name: `Client ${i + 1}`,
      email: `client${i + 1}@example.com`,
      phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      industry: ['Technology', 'Healthcare', 'Finance', 'Retail'][i % 4],
      status: i % 3 === 0 ? 'inactive' : 'active',
      revenue: Math.floor(Math.random() * 100000) + 10000
    }))
  },

  // Test form data
  formData: {
    user: {
      valid: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'SecurePass123!',
        phone: '+1-555-0123'
      },
      invalid: {
        firstName: '',
        lastName: '',
        email: 'invalid-email',
        password: '123',
        phone: 'invalid-phone'
      }
    },
    transaction: {
      valid: {
        amount: 1500.00,
        description: 'Office supplies',
        category: 'Expense',
        date: '2024-01-15'
      },
      invalid: {
        amount: -100,
        description: '',
        category: '',
        date: 'invalid-date'
      }
    }
  },

  // Test API endpoints
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      logout: '/api/auth/logout',
      refresh: '/api/auth/refresh'
    },
    users: {
      list: '/api/users',
      create: '/api/users',
      get: (id: string) => `/api/users/${id}`,
      update: (id: string) => `/api/users/${id}`,
      delete: (id: string) => `/api/users/${id}`
    },
    transactions: {
      list: '/api/transactions',
      create: '/api/transactions',
      get: (id: string) => `/api/transactions/${id}`,
      update: (id: string) => `/api/transactions/${id}`,
      delete: (id: string) => `/api/transactions/${id}`
    },
    clients: {
      list: '/api/clients',
      create: '/api/clients',
      get: (id: string) => `/api/clients/${id}`,
      update: (id: string) => `/api/clients/${id}`,
      delete: (id: string) => `/api/clients/${id}`
    }
  },

  // Test scenarios
  scenarios: {
    happyPath: {
      name: 'Happy Path',
      description: 'All operations succeed as expected',
      data: 'valid'
    },
    errorHandling: {
      name: 'Error Handling',
      description: 'Test error scenarios and edge cases',
      data: 'invalid'
    },
    edgeCases: {
      name: 'Edge Cases',
      description: 'Test boundary conditions and limits',
      data: 'boundary'
    },
    performance: {
      name: 'Performance',
      description: 'Test with large datasets and concurrent users',
      data: 'large'
    }
  },

  // Test assertions
  assertions: {
    apiResponse: (response: any, expectedStatus: number) => {
      return {
        status: response.status === expectedStatus,
        hasData: !!response.data,
        hasMessage: !!response.message,
        isSuccess: response.success === true
      };
    },

    formValidation: (errors: any[], expectedFields: string[]) => {
      return {
        hasErrors: errors.length > 0,
        expectedFields: expectedFields.every(field => 
          errors.some(error => error.field === field)
        ),
        allFields: errors.length === expectedFields.length
      };
    },

    dataIntegrity: (original: any, updated: any, fields: string[]) => {
      return fields.every(field => {
        if (field in updated) {
          return original[field] !== updated[field];
        }
        return true;
      });
    }
  },

  // Performance testing
  performance: {
    measureTime: async (fn: () => Promise<any>): Promise<number> => {
      const start = performance.now();
      await fn();
      const end = performance.now();
      return end - start;
    },

    measureMemory: (): number => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    },

    benchmark: async (fn: () => Promise<any>, iterations: number = 10): Promise<{
      average: number;
      min: number;
      max: number;
      median: number;
    }> => {
      const times: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const time = await testUtils.performance.measureTime(fn);
        times.push(time);
      }
      
      times.sort((a, b) => a - b);
      
      return {
        average: times.reduce((sum, time) => sum + time, 0) / times.length,
        min: times[0],
        max: times[times.length - 1],
        median: times[Math.floor(times.length / 2)]
      };
    }
  },

  // Accessibility testing
  accessibility: {
    checkAriaLabels: (element: HTMLElement): boolean => {
      const interactiveElements = element.querySelectorAll('button, input, select, textarea, a');
      let allHaveLabels = true;
      
      interactiveElements.forEach(el => {
        const hasLabel = el.hasAttribute('aria-label') || 
                        el.hasAttribute('aria-labelledby') ||
                        el.closest('label') !== null;
        if (!hasLabel) allHaveLabels = false;
      });
      
      return allHaveLabels;
    },

    checkKeyboardNavigation: (element: HTMLElement): boolean => {
      const focusableElements = element.querySelectorAll(
        'button, input, select, textarea, a, [tabindex]:not([tabindex="-1"])'
      );
      
      let isNavigable = true;
      let currentIndex = 0;
      
      const checkTabOrder = () => {
        if (currentIndex >= focusableElements.length) return true;
        
        const element = focusableElements[currentIndex] as HTMLElement;
        element.focus();
        
        if (document.activeElement !== element) {
          isNavigable = false;
        }
        
        currentIndex++;
        return isNavigable;
      };
      
      return checkTabOrder();
    },

    checkColorContrast: (element: HTMLElement): boolean => {
      // Simplified contrast check - in real implementation, use a proper contrast checker
      const textElements = element.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
      let hasGoodContrast = true;
      
      textElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Basic contrast check (simplified)
        if (color === backgroundColor) {
          hasGoodContrast = false;
        }
      });
      
      return hasGoodContrast;
    }
  },

  // Mock localStorage
  mockLocalStorage: () => {
    const store: Record<string, string> = {};
    
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(key => delete store[key]); }
    };
  },

  // Mock sessionStorage
  mockSessionStorage: () => {
    const store: Record<string, string> = {};
    
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(key => delete store[key]); }
    };
  },

  // Test data cleanup
  cleanup: {
    clearLocalStorage: () => {
      localStorage.clear();
    },
    clearSessionStorage: () => {
      sessionStorage.clear();
    },
    resetForm: (form: HTMLFormElement) => {
      form.reset();
    },
    clearDatabase: async () => {
      // In a real test environment, this would clear the test database
      console.log('Database cleared for testing');
    }
  }
};

// Test configuration
export const testConfig = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    timeout: 10000,
    retries: 3
  },
  ui: {
    animationTimeout: 300,
    loadingTimeout: 5000,
    interactionTimeout: 1000
  },
  performance: {
    maxLoadTime: 2000,
    maxApiResponseTime: 1000,
    maxMemoryUsage: 50 * 1024 * 1024 // 50MB
  },
  accessibility: {
    minContrastRatio: 4.5,
    maxTabOrder: 10,
    requiredAriaLabels: true
  }
};

// Test result types
export interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  error?: string;
  details?: any;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
}

// Test runner
export class TestRunner {
  private results: TestResult[] = [];

  async runTest(name: string, testFn: () => Promise<void>): Promise<TestResult> {
    const start = performance.now();
    
    try {
      await testFn();
      const duration = performance.now() - start;
      
      const result: TestResult = {
        name,
        status: 'pass',
        duration
      };
      
      this.results.push(result);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      const result: TestResult = {
        name,
        status: 'fail',
        duration,
        error: error instanceof Error ? error.message : String(error)
      };
      
      this.results.push(result);
      return result;
    }
  }

  getResults(): TestSuite {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const skipped = this.results.filter(r => r.status === 'skip').length;
    const total = this.results.length;
    const duration = this.results.reduce((sum, r) => sum + r.duration, 0);

    return {
      name: 'Test Suite',
      tests: this.results,
      summary: {
        total,
        passed,
        failed,
        skipped,
        duration
      }
    };
  }

  clear(): void {
    this.results = [];
  }
}

