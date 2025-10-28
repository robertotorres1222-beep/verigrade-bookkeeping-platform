import { Platform, Alert } from 'react-native';
import TouchID from 'react-native-touch-id';
import { BiometricAuth } from 'react-native-biometric-auth';

export interface BiometricConfig {
  title: string;
  subtitle?: string;
  description?: string;
  fallbackLabel?: string;
  cancelLabel?: string;
  sensorDescription?: string;
  sensorErrorDescription?: string;
}

export interface BiometricResult {
  success: boolean;
  error?: string;
  biometryType?: 'TouchID' | 'FaceID' | 'Fingerprint' | 'Face' | 'Iris';
}

class BiometricAuthService {
  private static instance: BiometricAuthService;
  private isAvailable: boolean = false;
  private biometryType: string | null = null;

  private constructor() {
    this.initializeBiometricAuth();
  }

  public static getInstance(): BiometricAuthService {
    if (!BiometricAuthService.instance) {
      BiometricAuthService.instance = new BiometricAuthService();
    }
    return BiometricAuthService.instance;
  }

  private async initializeBiometricAuth(): Promise<void> {
    try {
      await this.checkBiometricAvailability();
    } catch (error) {
      console.error('Biometric auth initialization error:', error);
    }
  }

  /**
   * Check if biometric authentication is available
   */
  async checkBiometricAvailability(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const result = await TouchID.isSupported();
        this.isAvailable = result;
        return result;
      } else if (Platform.OS === 'android') {
        const result = await BiometricAuth.isSupported();
        this.isAvailable = result;
        return result;
      }
      
      return false;
    } catch (error) {
      console.error('Biometric availability check error:', error);
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Get available biometric types
   */
  async getBiometricTypes(): Promise<string[]> {
    try {
      if (Platform.OS === 'ios') {
        const types = await TouchID.getSupportedBiometryType();
        return types ? [types] : [];
      } else if (Platform.OS === 'android') {
        const types = await BiometricAuth.getAvailableBiometrics();
        return types;
      }
      
      return [];
    } catch (error) {
      console.error('Get biometric types error:', error);
      return [];
    }
  }

  /**
   * Authenticate with biometrics
   */
  async authenticate(config: BiometricConfig = {}): Promise<BiometricResult> {
    try {
      if (!this.isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device',
        };
      }

      const defaultConfig: BiometricConfig = {
        title: 'Authenticate',
        subtitle: 'Use your biometric to continue',
        description: 'Use your fingerprint or face to authenticate',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
        ...config,
      };

      let result: BiometricResult;

      if (Platform.OS === 'ios') {
        result = await this.authenticateIOS(defaultConfig);
      } else if (Platform.OS === 'android') {
        result = await this.authenticateAndroid(defaultConfig);
      } else {
        return {
          success: false,
          error: 'Platform not supported',
        };
      }

      return result;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  /**
   * iOS biometric authentication
   */
  private async authenticateIOS(config: BiometricConfig): Promise<BiometricResult> {
    try {
      const result = await TouchID.authenticate(config.description || '', {
        title: config.title,
        imageColor: '#007AFF',
        imageErrorColor: '#FF3B30',
        sensorDescription: config.sensorDescription,
        sensorErrorDescription: config.sensorErrorDescription,
        fallbackLabel: config.fallbackLabel,
        cancelLabel: config.cancelLabel,
      });

      return {
        success: true,
        biometryType: result.biometryType,
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.getBiometricErrorMessage(error.code),
      };
    }
  }

  /**
   * Android biometric authentication
   */
  private async authenticateAndroid(config: BiometricConfig): Promise<BiometricResult> {
    try {
      const result = await BiometricAuth.authenticate({
        title: config.title,
        subtitle: config.subtitle,
        description: config.description,
        fallbackLabel: config.fallbackLabel,
        cancelLabel: config.cancelLabel,
      });

      return {
        success: true,
        biometryType: result.biometryType,
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.getBiometricErrorMessage(error.code),
      };
    }
  }

  /**
   * Get biometric error message
   */
  private getBiometricErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'TouchIDNotAvailable':
        return 'Touch ID is not available on this device';
      case 'TouchIDNotEnrolled':
        return 'Touch ID is not enrolled. Please set up Touch ID in Settings.';
      case 'TouchIDLockout':
        return 'Touch ID is locked. Please use your passcode to unlock.';
      case 'TouchIDCancel':
        return 'Authentication was cancelled';
      case 'TouchIDFallback':
        return 'Fallback authentication was used';
      case 'TouchIDUserCancel':
        return 'User cancelled authentication';
      case 'TouchIDSystemCancel':
        return 'System cancelled authentication';
      case 'TouchIDPasscodeNotSet':
        return 'Passcode is not set. Please set up a passcode.';
      case 'TouchIDNotSupported':
        return 'Touch ID is not supported on this device';
      case 'FaceIDNotAvailable':
        return 'Face ID is not available on this device';
      case 'FaceIDNotEnrolled':
        return 'Face ID is not enrolled. Please set up Face ID in Settings.';
      case 'FaceIDLockout':
        return 'Face ID is locked. Please use your passcode to unlock.';
      case 'FaceIDCancel':
        return 'Face ID authentication was cancelled';
      case 'FaceIDUserCancel':
        return 'User cancelled Face ID authentication';
      case 'FaceIDSystemCancel':
        return 'System cancelled Face ID authentication';
      case 'FaceIDPasscodeNotSet':
        return 'Passcode is not set. Please set up a passcode.';
      case 'FaceIDNotSupported':
        return 'Face ID is not supported on this device';
      case 'BiometricNotAvailable':
        return 'Biometric authentication is not available';
      case 'BiometricNotEnrolled':
        return 'Biometric authentication is not enrolled';
      case 'BiometricLockout':
        return 'Biometric authentication is locked';
      case 'BiometricCancel':
        return 'Biometric authentication was cancelled';
      case 'BiometricUserCancel':
        return 'User cancelled biometric authentication';
      case 'BiometricSystemCancel':
        return 'System cancelled biometric authentication';
      case 'BiometricPasscodeNotSet':
        return 'Passcode is not set';
      case 'BiometricNotSupported':
        return 'Biometric authentication is not supported';
      default:
        return 'Authentication failed. Please try again.';
    }
  }

  /**
   * Check if biometric authentication is enabled
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const isAvailable = await this.checkBiometricAvailability();
      return isAvailable;
    } catch (error) {
      console.error('Check biometric enabled error:', error);
      return false;
    }
  }

  /**
   * Enable biometric authentication
   */
  async enableBiometric(): Promise<boolean> {
    try {
      const result = await this.authenticate({
        title: 'Enable Biometric Authentication',
        subtitle: 'Use your biometric to enable authentication',
        description: 'This will allow you to use biometric authentication for quick access to the app.',
      });

      return result.success;
    } catch (error) {
      console.error('Enable biometric error:', error);
      return false;
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometric(): Promise<boolean> {
    try {
      // In a real implementation, you would store this preference
      // and check it before attempting biometric authentication
      return true;
    } catch (error) {
      console.error('Disable biometric error:', error);
      return false;
    }
  }

  /**
   * Show biometric setup prompt
   */
  showBiometricSetupPrompt(): void {
    Alert.alert(
      'Enable Biometric Authentication',
      'Would you like to enable biometric authentication for quick and secure access to the app?',
      [
        {
          text: 'Not Now',
          style: 'cancel',
        },
        {
          text: 'Enable',
          onPress: () => this.enableBiometric(),
        },
      ]
    );
  }

  /**
   * Show biometric authentication prompt
   */
  async showBiometricPrompt(
    title: string = 'Authenticate',
    subtitle: string = 'Use your biometric to continue'
  ): Promise<BiometricResult> {
    return this.authenticate({
      title,
      subtitle,
      description: 'Use your fingerprint or face to authenticate',
    });
  }

  /**
   * Quick authentication for app access
   */
  async quickAuthenticate(): Promise<BiometricResult> {
    return this.authenticate({
      title: 'Quick Access',
      subtitle: 'Use your biometric to access the app',
      description: 'Use your fingerprint or face for quick access',
    });
  }

  /**
   * Authentication for sensitive operations
   */
  async authenticateForSensitiveOperation(operation: string): Promise<BiometricResult> {
    return this.authenticate({
      title: 'Secure Access Required',
      subtitle: `Authenticate to ${operation}`,
      description: `Use your biometric to securely ${operation.toLowerCase()}`,
    });
  }

  /**
   * Get biometric type
   */
  getBiometricType(): string | null {
    return this.biometryType;
  }

  /**
   * Check if biometric is available
   */
  isBiometricAvailable(): boolean {
    return this.isAvailable;
  }
}

export default BiometricAuthService;










