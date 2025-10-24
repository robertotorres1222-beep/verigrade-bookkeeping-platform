import { Platform, Alert } from 'react-native';
import { ApplePay } from 'react-native-apple-pay';
import { GooglePay } from 'react-native-google-pay';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay' | 'bank_account';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isVerified: boolean;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  merchantId: string;
  orderId: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentMethodId?: string;
  error?: string;
  requiresAction?: boolean;
  clientSecret?: string;
}

export interface ApplePayConfig {
  merchantId: string;
  merchantName: string;
  supportedNetworks: string[];
  merchantCapabilities: string[];
  countryCode: string;
  currencyCode: string;
}

export interface GooglePayConfig {
  merchantId: string;
  merchantName: string;
  environment: 'TEST' | 'PRODUCTION';
  countryCode: string;
  currencyCode: string;
}

class MobilePaymentService {
  private static instance: MobilePaymentService;
  private applePayConfig: ApplePayConfig;
  private googlePayConfig: GooglePayConfig;
  private isApplePayAvailable: boolean = false;
  private isGooglePayAvailable: boolean = false;

  private constructor() {
    this.initializePaymentMethods();
  }

  public static getInstance(): MobilePaymentService {
    if (!MobilePaymentService.instance) {
      MobilePaymentService.instance = new MobilePaymentService();
    }
    return MobilePaymentService.instance;
  }

  private async initializePaymentMethods(): Promise<void> {
    // Initialize Apple Pay
    if (Platform.OS === 'ios') {
      try {
        this.isApplePayAvailable = await ApplePay.canMakePayments();
        this.applePayConfig = {
          merchantId: 'merchant.com.verigrade.bookkeeping',
          merchantName: 'VeriGrade',
          supportedNetworks: ['visa', 'mastercard', 'amex', 'discover'],
          merchantCapabilities: ['3DS', 'debit', 'credit'],
          countryCode: 'US',
          currencyCode: 'USD'
        };
      } catch (error) {
        console.error('Apple Pay initialization error:', error);
        this.isApplePayAvailable = false;
      }
    }

    // Initialize Google Pay
    if (Platform.OS === 'android') {
      try {
        this.isGooglePayAvailable = await GooglePay.isReadyToPay({
          allowedPaymentMethods: [
            {
              type: 'CARD',
              parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER']
              }
            }
          ]
        });

        this.googlePayConfig = {
          merchantId: 'merchant.com.verigrade.bookkeeping',
          merchantName: 'VeriGrade',
          environment: __DEV__ ? 'TEST' : 'PRODUCTION',
          countryCode: 'US',
          currencyCode: 'USD'
        };
      } catch (error) {
        console.error('Google Pay initialization error:', error);
        this.isGooglePayAvailable = false;
      }
    }
  }

  /**
   * Check if Apple Pay is available
   */
  public isApplePaySupported(): boolean {
    return Platform.OS === 'ios' && this.isApplePayAvailable;
  }

  /**
   * Check if Google Pay is available
   */
  public isGooglePaySupported(): boolean {
    return Platform.OS === 'android' && this.isGooglePayAvailable;
  }

  /**
   * Get available payment methods
   */
  public async getAvailablePaymentMethods(): Promise<PaymentMethod[]> {
    const methods: PaymentMethod[] = [];

    // Add Apple Pay if available
    if (this.isApplePaySupported()) {
      methods.push({
        id: 'apple_pay',
        type: 'apple_pay',
        isDefault: false,
        isVerified: true
      });
    }

    // Add Google Pay if available
    if (this.isGooglePaySupported()) {
      methods.push({
        id: 'google_pay',
        type: 'google_pay',
        isDefault: false,
        isVerified: true
      });
    }

    // Load saved payment methods
    const savedMethods = await this.getSavedPaymentMethods();
    methods.push(...savedMethods);

    return methods;
  }

  /**
   * Process payment with Apple Pay
   */
  public async processApplePayPayment(request: PaymentRequest): Promise<PaymentResult> {
    if (!this.isApplePaySupported()) {
      return {
        success: false,
        error: 'Apple Pay is not available on this device'
      };
    }

    try {
      const paymentRequest = {
        merchantIdentifier: this.applePayConfig.merchantId,
        supportedNetworks: this.applePayConfig.supportedNetworks,
        merchantCapabilities: this.applePayConfig.merchantCapabilities,
        countryCode: this.applePayConfig.countryCode,
        currencyCode: this.applePayConfig.currencyCode,
        paymentItems: [
          {
            label: request.description,
            amount: request.amount.toString(),
            type: 'final'
          }
        ]
      };

      const paymentToken = await ApplePay.requestPayment(paymentRequest);
      
      // Process payment with backend
      const result = await this.processPaymentWithBackend({
        ...request,
        paymentMethod: 'apple_pay',
        paymentToken: paymentToken
      });

      return result;

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Apple Pay payment failed'
      };
    }
  }

  /**
   * Process payment with Google Pay
   */
  public async processGooglePayPayment(request: PaymentRequest): Promise<PaymentResult> {
    if (!this.isGooglePaySupported()) {
      return {
        success: false,
        error: 'Google Pay is not available on this device'
      };
    }

    try {
      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER']
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: 'stripe',
                gatewayMerchantId: this.googlePayConfig.merchantId
              }
            }
          }
        ],
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: request.amount.toString(),
          currencyCode: request.currency
        },
        merchantInfo: {
          merchantId: this.googlePayConfig.merchantId,
          merchantName: this.googlePayConfig.merchantName
        }
      };

      const paymentData = await GooglePay.requestPayment(paymentDataRequest);
      
      // Process payment with backend
      const result = await this.processPaymentWithBackend({
        ...request,
        paymentMethod: 'google_pay',
        paymentData: paymentData
      });

      return result;

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Google Pay payment failed'
      };
    }
  }

  /**
   * Process payment with backend
   */
  private async processPaymentWithBackend(paymentData: any): Promise<PaymentResult> {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/api/payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          transactionId: result.transactionId,
          paymentMethodId: result.paymentMethodId
        };
      } else {
        return {
          success: false,
          error: result.error || 'Payment processing failed'
        };
      }

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error during payment processing'
      };
    }
  }

  /**
   * Save payment method
   */
  public async savePaymentMethod(method: PaymentMethod): Promise<void> {
    try {
      const savedMethods = await this.getSavedPaymentMethods();
      const existingIndex = savedMethods.findIndex(m => m.id === method.id);
      
      if (existingIndex >= 0) {
        savedMethods[existingIndex] = method;
      } else {
        savedMethods.push(method);
      }

      await AsyncStorage.setItem('saved_payment_methods', JSON.stringify(savedMethods));
    } catch (error) {
      console.error('Error saving payment method:', error);
    }
  }

  /**
   * Get saved payment methods
   */
  public async getSavedPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const stored = await AsyncStorage.getItem('saved_payment_methods');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading saved payment methods:', error);
      return [];
    }
  }

  /**
   * Delete payment method
   */
  public async deletePaymentMethod(methodId: string): Promise<void> {
    try {
      const savedMethods = await this.getSavedPaymentMethods();
      const filteredMethods = savedMethods.filter(m => m.id !== methodId);
      await AsyncStorage.setItem('saved_payment_methods', JSON.stringify(filteredMethods));
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  }

  /**
   * Set default payment method
   */
  public async setDefaultPaymentMethod(methodId: string): Promise<void> {
    try {
      const savedMethods = await this.getSavedPaymentMethods();
      const updatedMethods = savedMethods.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }));

      await AsyncStorage.setItem('saved_payment_methods', JSON.stringify(updatedMethods));
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  }

  /**
   * Get payment method by ID
   */
  public async getPaymentMethod(methodId: string): Promise<PaymentMethod | null> {
    const methods = await this.getSavedPaymentMethods();
    return methods.find(m => m.id === methodId) || null;
  }

  /**
   * Validate payment amount
   */
  public validatePaymentAmount(amount: number): { isValid: boolean; error?: string } {
    if (amount <= 0) {
      return { isValid: false, error: 'Payment amount must be greater than zero' };
    }

    if (amount > 100000) {
      return { isValid: false, error: 'Payment amount cannot exceed $100,000' };
    }

    return { isValid: true };
  }

  /**
   * Format payment amount for display
   */
  public formatPaymentAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Get payment history
   */
  public async getPaymentHistory(limit: number = 50): Promise<any[]> {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/api/payments/history?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      const result = await response.json();
      return result.payments || [];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }

  /**
   * Refund payment
   */
  public async refundPayment(transactionId: string, amount?: number): Promise<PaymentResult> {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/api/payments/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          transactionId,
          amount
        })
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          transactionId: result.refundId
        };
      } else {
        return {
          success: false,
          error: result.error || 'Refund failed'
        };
      }

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error during refund'
      };
    }
  }

  /**
   * Get authentication token
   */
  private async getAuthToken(): Promise<string> {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  }

  /**
   * Show payment method selection
   */
  public async showPaymentMethodSelection(
    request: PaymentRequest,
    onMethodSelected: (method: PaymentMethod) => void
  ): Promise<void> {
    const methods = await this.getAvailablePaymentMethods();
    
    if (methods.length === 0) {
      Alert.alert('No Payment Methods', 'No payment methods are available on this device.');
      return;
    }

    if (methods.length === 1) {
      onMethodSelected(methods[0]);
      return;
    }

    // Show selection dialog
    const methodNames = methods.map(method => {
      switch (method.type) {
        case 'apple_pay':
          return 'Apple Pay';
        case 'google_pay':
          return 'Google Pay';
        case 'card':
          return `**** ${method.last4} (${method.brand})`;
        default:
          return 'Payment Method';
      }
    });

    Alert.alert(
      'Select Payment Method',
      'Choose how you would like to pay:',
      methods.map((method, index) => ({
        text: methodNames[index],
        onPress: () => onMethodSelected(method)
      }))
    );
  }

  /**
   * Process payment with selected method
   */
  public async processPayment(
    request: PaymentRequest,
    method: PaymentMethod
  ): Promise<PaymentResult> {
    switch (method.type) {
      case 'apple_pay':
        return this.processApplePayPayment(request);
      case 'google_pay':
        return this.processGooglePayPayment(request);
      default:
        return {
          success: false,
          error: 'Unsupported payment method'
        };
    }
  }
}

export default MobilePaymentService;