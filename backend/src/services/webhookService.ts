import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import axios from 'axios';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  organizationId: string;
  createdAt: Date;
  lastTriggered?: Date;
  successCount: number;
  failureCount: number;
  headers?: Record<string, string>;
  timeout: number;
  retryCount: number;
  retryDelay: number;
}

interface WebhookEvent {
  id: string;
  webhookId: string;
  event: string;
  payload: any;
  status: 'pending' | 'sent' | 'failed' | 'retrying';
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: Date;
  createdAt: Date;
  sentAt?: Date;
  errorMessage?: string;
  responseCode?: number;
  responseBody?: string;
}

interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventId: string;
  attempt: number;
  status: 'success' | 'failed';
  responseCode: number;
  responseBody: string;
  duration: number;
  createdAt: Date;
  errorMessage?: string;
}

class WebhookService {
  private webhooks: Map<string, Webhook> = new Map();
  private events: Map<string, WebhookEvent> = new Map();
  private deliveries: Map<string, WebhookDelivery> = new Map();

  /**
   * Create a new webhook
   */
  async createWebhook(
    name: string,
    url: string,
    events: string[],
    organizationId: string,
    headers?: Record<string, string>,
    timeout: number = 30000,
    retryCount: number = 3,
    retryDelay: number = 1000
  ): Promise<Webhook> {
    const webhook: Webhook = {
      id: uuidv4(),
      name,
      url,
      events,
      secret: this.generateSecret(),
      isActive: true,
      organizationId,
      createdAt: new Date(),
      successCount: 0,
      failureCount: 0,
      headers,
      timeout,
      retryCount,
      retryDelay
    };

    this.webhooks.set(webhook.id, webhook);
    return webhook;
  }

  /**
   * Update webhook
   */
  async updateWebhook(
    webhookId: string,
    updates: Partial<Omit<Webhook, 'id' | 'organizationId' | 'createdAt'>>
  ): Promise<Webhook | null> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) return null;

    const updatedWebhook = { ...webhook, ...updates };
    this.webhooks.set(webhookId, updatedWebhook);
    return updatedWebhook;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId: string, organizationId: string): Promise<boolean> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook || webhook.organizationId !== organizationId) return false;

    this.webhooks.delete(webhookId);
    return true;
  }

  /**
   * Get webhook by ID
   */
  getWebhook(webhookId: string, organizationId: string): Webhook | null {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook || webhook.organizationId !== organizationId) return null;
    return webhook;
  }

  /**
   * Get all webhooks for organization
   */
  getWebhooks(organizationId: string): Webhook[] {
    return Array.from(this.webhooks.values())
      .filter(webhook => webhook.organizationId === organizationId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Trigger webhook event
   */
  async triggerWebhook(
    event: string,
    payload: any,
    organizationId: string
  ): Promise<void> {
    const webhooks = this.getWebhooks(organizationId)
      .filter(webhook => webhook.isActive && webhook.events.includes(event));

    for (const webhook of webhooks) {
      await this.createWebhookEvent(webhook.id, event, payload);
    }
  }

  /**
   * Create webhook event
   */
  private async createWebhookEvent(
    webhookId: string,
    event: string,
    payload: any
  ): Promise<WebhookEvent> {
    const webhookEvent: WebhookEvent = {
      id: uuidv4(),
      webhookId,
      event,
      payload,
      status: 'pending',
      attempts: 0,
      maxAttempts: this.webhooks.get(webhookId)?.retryCount || 3,
      createdAt: new Date()
    };

    this.events.set(webhookEvent.id, webhookEvent);
    
    // Process event immediately
    this.processWebhookEvent(webhookEvent.id);
    
    return webhookEvent;
  }

  /**
   * Process webhook event
   */
  private async processWebhookEvent(eventId: string): Promise<void> {
    const event = this.events.get(eventId);
    if (!event) return;

    const webhook = this.webhooks.get(event.webhookId);
    if (!webhook) return;

    try {
      event.attempts++;
      event.status = 'retrying';

      const delivery = await this.deliverWebhook(webhook, event);
      
      if (delivery.status === 'success') {
        event.status = 'sent';
        event.sentAt = new Date();
        webhook.successCount++;
        webhook.lastTriggered = new Date();
      } else {
        event.status = 'failed';
        event.errorMessage = delivery.errorMessage;
        webhook.failureCount++;
      }

      this.events.set(eventId, event);
      this.webhooks.set(webhook.id, webhook);
      
    } catch (error) {
      event.status = 'failed';
      event.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.events.set(eventId, event);
    }
  }

  /**
   * Deliver webhook
   */
  private async deliverWebhook(
    webhook: Webhook,
    event: WebhookEvent
  ): Promise<WebhookDelivery> {
    const deliveryId = uuidv4();
    const startTime = Date.now();

    try {
      const signature = this.generateSignature(webhook.secret, JSON.stringify(event.payload));
      
      const headers = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': event.event,
        'X-Webhook-Delivery': deliveryId,
        ...webhook.headers
      };

      const response = await axios.post(webhook.url, event.payload, {
        headers,
        timeout: webhook.timeout,
        validateStatus: (status) => status < 500 // Don't throw on 4xx errors
      });

      const delivery: WebhookDelivery = {
        id: deliveryId,
        webhookId: webhook.id,
        eventId: event.id,
        attempt: event.attempts,
        status: response.status >= 200 && response.status < 300 ? 'success' : 'failed',
        responseCode: response.status,
        responseBody: response.data,
        duration: Date.now() - startTime,
        createdAt: new Date()
      };

      this.deliveries.set(deliveryId, delivery);
      return delivery;

    } catch (error) {
      const delivery: WebhookDelivery = {
        id: deliveryId,
        webhookId: webhook.id,
        eventId: event.id,
        attempt: event.attempts,
        status: 'failed',
        responseCode: 0,
        responseBody: '',
        duration: Date.now() - startTime,
        createdAt: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };

      this.deliveries.set(deliveryId, delivery);
      return delivery;
    }
  }

  /**
   * Get webhook events
   */
  getWebhookEvents(webhookId: string, organizationId: string): WebhookEvent[] {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook || webhook.organizationId !== organizationId) return [];

    return Array.from(this.events.values())
      .filter(event => event.webhookId === webhookId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get webhook deliveries
   */
  getWebhookDeliveries(webhookId: string, organizationId: string): WebhookDelivery[] {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook || webhook.organizationId !== organizationId) return [];

    return Array.from(this.deliveries.values())
      .filter(delivery => delivery.webhookId === webhookId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Retry failed webhook
   */
  async retryWebhook(eventId: string, organizationId: string): Promise<boolean> {
    const event = this.events.get(eventId);
    if (!event) return false;

    const webhook = this.webhooks.get(event.webhookId);
    if (!webhook || webhook.organizationId !== organizationId) return false;

    if (event.attempts >= event.maxAttempts) {
      return false;
    }

    // Schedule retry
    setTimeout(() => {
      this.processWebhookEvent(eventId);
    }, webhook.retryDelay * Math.pow(2, event.attempts - 1)); // Exponential backoff

    return true;
  }

  /**
   * Test webhook
   */
  async testWebhook(webhookId: string, organizationId: string): Promise<{
    success: boolean;
    responseCode?: number;
    responseBody?: string;
    duration: number;
    error?: string;
  }> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook || webhook.organizationId !== organizationId) {
      throw new Error('Webhook not found');
    }

    const testPayload = {
      event: 'webhook.test',
      data: {
        message: 'This is a test webhook',
        timestamp: new Date().toISOString()
      }
    };

    const startTime = Date.now();
    
    try {
      const signature = this.generateSignature(webhook.secret, JSON.stringify(testPayload));
      
      const headers = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': 'webhook.test',
        'X-Webhook-Delivery': 'test',
        ...webhook.headers
      };

      const response = await axios.post(webhook.url, testPayload, {
        headers,
        timeout: webhook.timeout,
        validateStatus: (status) => status < 500
      });

      return {
        success: response.status >= 200 && response.status < 300,
        responseCode: response.status,
        responseBody: response.data,
        duration: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get webhook statistics
   */
  getWebhookStats(organizationId: string): {
    totalWebhooks: number;
    activeWebhooks: number;
    totalEvents: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    averageResponseTime: number;
  } {
    const webhooks = this.getWebhooks(organizationId);
    const events = Array.from(this.events.values())
      .filter(event => webhooks.some(w => w.id === event.webhookId));
    const deliveries = Array.from(this.deliveries.values())
      .filter(delivery => webhooks.some(w => w.id === delivery.webhookId));

    const successfulDeliveries = deliveries.filter(d => d.status === 'success').length;
    const failedDeliveries = deliveries.filter(d => d.status === 'failed').length;
    const averageResponseTime = deliveries.length > 0 
      ? deliveries.reduce((sum, d) => sum + d.duration, 0) / deliveries.length 
      : 0;

    return {
      totalWebhooks: webhooks.length,
      activeWebhooks: webhooks.filter(w => w.isActive).length,
      totalEvents: events.length,
      successfulDeliveries,
      failedDeliveries,
      averageResponseTime
    };
  }

  /**
   * Generate webhook secret
   */
  private generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate webhook signature
   */
  private generateSignature(secret: string, payload: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(signature: string, secret: string, payload: string): boolean {
    const expectedSignature = this.generateSignature(secret, payload);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Clean up old webhook events
   */
  cleanupOldEvents(daysOld: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    for (const [eventId, event] of this.events.entries()) {
      if (event.createdAt < cutoffDate) {
        this.events.delete(eventId);
      }
    }
  }

  /**
   * Get available webhook events
   */
  getAvailableEvents(): string[] {
    return [
      'transaction.created',
      'transaction.updated',
      'transaction.deleted',
      'invoice.created',
      'invoice.updated',
      'invoice.deleted',
      'invoice.paid',
      'invoice.overdue',
      'customer.created',
      'customer.updated',
      'customer.deleted',
      'payment.created',
      'payment.updated',
      'payment.deleted',
      'expense.created',
      'expense.updated',
      'expense.deleted',
      'user.created',
      'user.updated',
      'user.deleted',
      'organization.updated',
      'webhook.test'
    ];
  }
}

export default new WebhookService();

