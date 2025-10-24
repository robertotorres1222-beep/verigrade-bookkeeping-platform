import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { PermissionsAndroid } from 'react-native';

export interface VoiceCommand {
  command: string;
  intent: string;
  entities: any;
  confidence: number;
  action: string;
  parameters: any;
}

export interface VoiceResponse {
  text: string;
  action?: string;
  parameters?: any;
  success: boolean;
  error?: string;
}

export class AIVoiceCommandService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private isListening = false;

  /**
   * Initialize voice command service
   */
  async initialize(): Promise<void> {
    try {
      // Request audio permissions
      await this.requestAudioPermissions();
      
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

    } catch (error) {
      console.error('Error initializing voice command service:', error);
      throw error;
    }
  }

  /**
   * Start listening for voice commands
   */
  async startListening(): Promise<void> {
    try {
      if (this.isRecording) {
        await this.stopListening();
      }

      this.isListening = true;
      
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(recordingOptions);
      await this.recording.startAsync();

    } catch (error) {
      console.error('Error starting voice recording:', error);
      this.isListening = false;
      throw error;
    }
  }

  /**
   * Stop listening and process the audio
   */
  async stopListening(): Promise<VoiceResponse> {
    try {
      if (!this.recording || !this.isListening) {
        throw new Error('Not currently recording');
      }

      this.isListening = false;
      await this.recording.stopAndUnloadAsync();
      
      const uri = this.recording.getURI();
      this.recording = null;

      if (!uri) {
        throw new Error('No audio recorded');
      }

      // Process the audio and return response
      const command = await this.processAudioToText(uri);
      const response = await this.processVoiceCommand(command);

      return response;

    } catch (error) {
      console.error('Error stopping voice recording:', error);
      this.isListening = false;
      return {
        text: 'Sorry, I had trouble processing your voice command.',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process audio to text using speech recognition
   */
  private async processAudioToText(audioUri: string): Promise<string> {
    try {
      // In a real implementation, you would send the audio to a speech-to-text service
      // For now, we'll simulate with a mock response
      return "Create expense for $25 at Starbucks";
      
    } catch (error) {
      console.error('Error processing audio to text:', error);
      throw error;
    }
  }

  /**
   * Process voice command and determine intent
   */
  private async processVoiceCommand(command: string): Promise<VoiceResponse> {
    try {
      const voiceCommand = await this.parseVoiceCommand(command);
      
      switch (voiceCommand.intent) {
        case 'create_expense':
          return await this.handleCreateExpense(voiceCommand);
        
        case 'show_revenue':
          return await this.handleShowRevenue(voiceCommand);
        
        case 'send_invoice':
          return await this.handleSendInvoice(voiceCommand);
        
        case 'show_dashboard':
          return await this.handleShowDashboard(voiceCommand);
        
        case 'create_invoice':
          return await this.handleCreateInvoice(voiceCommand);
        
        case 'show_expenses':
          return await this.handleShowExpenses(voiceCommand);
        
        case 'financial_query':
          return await this.handleFinancialQuery(voiceCommand);
        
        default:
          return {
            text: "I didn't understand that command. Try saying 'Create expense', 'Show revenue', or 'Send invoice'.",
            success: false
          };
      }

    } catch (error) {
      console.error('Error processing voice command:', error);
      return {
        text: 'Sorry, I had trouble understanding your command.',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Parse voice command to extract intent and entities
   */
  private async parseVoiceCommand(command: string): Promise<VoiceCommand> {
    // This would typically use NLP services to parse the command
    // For now, we'll use simple pattern matching
    
    const lowerCommand = command.toLowerCase();
    
    // Intent detection
    let intent = 'unknown';
    let entities: any = {};
    let confidence = 0.8;

    if (lowerCommand.includes('create expense') || lowerCommand.includes('add expense')) {
      intent = 'create_expense';
      entities = this.extractExpenseEntities(command);
    } else if (lowerCommand.includes('show revenue') || lowerCommand.includes('revenue')) {
      intent = 'show_revenue';
    } else if (lowerCommand.includes('send invoice') || lowerCommand.includes('invoice')) {
      intent = 'send_invoice';
      entities = this.extractInvoiceEntities(command);
    } else if (lowerCommand.includes('dashboard') || lowerCommand.includes('overview')) {
      intent = 'show_dashboard';
    } else if (lowerCommand.includes('create invoice') || lowerCommand.includes('new invoice')) {
      intent = 'create_invoice';
    } else if (lowerCommand.includes('show expenses') || lowerCommand.includes('expenses')) {
      intent = 'show_expenses';
    } else if (lowerCommand.includes('what') || lowerCommand.includes('how much') || lowerCommand.includes('tell me')) {
      intent = 'financial_query';
    }

    return {
      command,
      intent,
      entities,
      confidence,
      action: this.getActionForIntent(intent),
      parameters: entities
    };
  }

  /**
   * Extract expense entities from command
   */
  private extractExpenseEntities(command: string): any {
    const entities: any = {};
    
    // Extract amount
    const amountMatch = command.match(/\$?(\d+(?:\.\d{2})?)/);
    if (amountMatch) {
      entities.amount = parseFloat(amountMatch[1]);
    }
    
    // Extract merchant
    const merchantKeywords = ['at', 'from', 'to'];
    for (const keyword of merchantKeywords) {
      const index = command.toLowerCase().indexOf(keyword);
      if (index !== -1) {
        entities.merchant = command.substring(index + keyword.length).trim();
        break;
      }
    }
    
    // Extract category
    const categoryKeywords = {
      'travel': ['travel', 'flight', 'hotel', 'uber', 'lyft'],
      'meals': ['lunch', 'dinner', 'coffee', 'restaurant', 'food'],
      'office': ['office', 'supplies', 'stationery'],
      'marketing': ['marketing', 'advertising', 'ads'],
      'software': ['software', 'subscription', 'saas']
    };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => command.toLowerCase().includes(keyword))) {
        entities.category = category;
        break;
      }
    }
    
    return entities;
  }

  /**
   * Extract invoice entities from command
   */
  private extractInvoiceEntities(command: string): any {
    const entities: any = {};
    
    // Extract client name
    const clientKeywords = ['to', 'for', 'client'];
    for (const keyword of clientKeywords) {
      const index = command.toLowerCase().indexOf(keyword);
      if (index !== -1) {
        entities.client = command.substring(index + keyword.length).trim();
        break;
      }
    }
    
    // Extract amount
    const amountMatch = command.match(/\$?(\d+(?:\.\d{2})?)/);
    if (amountMatch) {
      entities.amount = parseFloat(amountMatch[1]);
    }
    
    return entities;
  }

  /**
   * Get action for intent
   */
  private getActionForIntent(intent: string): string {
    const actionMap: { [key: string]: string } = {
      'create_expense': 'navigate_to_expense_form',
      'show_revenue': 'navigate_to_revenue_dashboard',
      'send_invoice': 'navigate_to_invoice_list',
      'show_dashboard': 'navigate_to_dashboard',
      'create_invoice': 'navigate_to_invoice_form',
      'show_expenses': 'navigate_to_expense_list',
      'financial_query': 'process_financial_query'
    };
    
    return actionMap[intent] || 'unknown';
  }

  /**
   * Handle create expense command
   */
  private async handleCreateExpense(command: VoiceCommand): Promise<VoiceResponse> {
    const { amount, merchant, category } = command.entities;
    
    let responseText = "Creating expense";
    
    if (amount) {
      responseText += ` for $${amount}`;
    }
    
    if (merchant) {
      responseText += ` at ${merchant}`;
    }
    
    if (category) {
      responseText += ` (${category})`;
    }
    
    responseText += ". Please confirm the details.";
    
    return {
      text: responseText,
      action: 'navigate_to_expense_form',
      parameters: command.entities,
      success: true
    };
  }

  /**
   * Handle show revenue command
   */
  private async handleShowRevenue(command: VoiceCommand): Promise<VoiceResponse> {
    return {
      text: "Showing your revenue dashboard.",
      action: 'navigate_to_revenue_dashboard',
      success: true
    };
  }

  /**
   * Handle send invoice command
   */
  private async handleSendInvoice(command: VoiceCommand): Promise<VoiceResponse> {
    const { client, amount } = command.entities;
    
    let responseText = "Sending invoice";
    
    if (client) {
      responseText += ` to ${client}`;
    }
    
    if (amount) {
      responseText += ` for $${amount}`;
    }
    
    responseText += ".";
    
    return {
      text: responseText,
      action: 'navigate_to_invoice_list',
      parameters: command.entities,
      success: true
    };
  }

  /**
   * Handle show dashboard command
   */
  private async handleShowDashboard(command: VoiceCommand): Promise<VoiceResponse> {
    return {
      text: "Showing your financial dashboard.",
      action: 'navigate_to_dashboard',
      success: true
    };
  }

  /**
   * Handle create invoice command
   */
  private async handleCreateInvoice(command: VoiceCommand): Promise<VoiceResponse> {
    const { client, amount } = command.entities;
    
    let responseText = "Creating invoice";
    
    if (client) {
      responseText += ` for ${client}`;
    }
    
    if (amount) {
      responseText += ` for $${amount}`;
    }
    
    responseText += ".";
    
    return {
      text: responseText,
      action: 'navigate_to_invoice_form',
      parameters: command.entities,
      success: true
    };
  }

  /**
   * Handle show expenses command
   */
  private async handleShowExpenses(command: VoiceCommand): Promise<VoiceResponse> {
    return {
      text: "Showing your expense list.",
      action: 'navigate_to_expense_list',
      success: true
    };
  }

  /**
   * Handle financial query command
   */
  private async handleFinancialQuery(command: VoiceCommand): Promise<VoiceResponse> {
    return {
      text: "Processing your financial query. Let me get that information for you.",
      action: 'process_financial_query',
      parameters: { query: command.command },
      success: true
    };
  }

  /**
   * Speak response text
   */
  async speakResponse(text: string): Promise<void> {
    try {
      await Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9
      });
    } catch (error) {
      console.error('Error speaking response:', error);
    }
  }

  /**
   * Stop speaking
   */
  async stopSpeaking(): Promise<void> {
    try {
      await Speech.stop();
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }

  /**
   * Request audio permissions
   */
  private async requestAudioPermissions(): Promise<void> {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Voice Command Permission',
          message: 'This app needs access to your microphone to process voice commands.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error('Microphone permission denied');
      }
    }
  }

  /**
   * Check if currently listening
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Get available voice commands
   */
  getAvailableCommands(): string[] {
    return [
      "Create expense for $25 at Starbucks",
      "Show revenue",
      "Send invoice to John Smith",
      "Show dashboard",
      "Create invoice for $500",
      "Show expenses",
      "What's my cash flow?",
      "How much did I spend this month?"
    ];
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }
      
      await Speech.stop();
      this.isListening = false;
      this.isRecording = false;
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

export default AIVoiceCommandService;






