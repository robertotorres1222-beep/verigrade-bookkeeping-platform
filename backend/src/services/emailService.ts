import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  template?: 'welcome' | 'passwordReset' | 'invoice' | 'contactForm' | 'contactAutoReply';
  data?: Record<string, any>;
  html?: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env['SMTP_HOST'],
      port: parseInt(process.env['SMTP_PORT'] || '587'),
      secure: process.env['SMTP_SECURE'] === 'true',
      auth: {
        user: process.env['SMTP_USER'],
        pass: process.env['SMTP_PASS'],
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      let html = options.html;
      let text = options.text;

      // Generate HTML from template if template is provided
      if (options.template && options.data) {
        html = this.generateTemplate(options.template, options.data);
        text = this.generateTextTemplate(options.template, options.data);
      }

      const mailOptions = {
        from: process.env['FROM_EMAIL'] || 'noreply@verigrade.com',
        to: options.to,
        subject: options.subject,
        html,
        text,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to}`);
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  private generateTemplate(template: string, data: Record<string, any>): string {
    // Simple template engine - in production, use a proper templating engine like Handlebars
    const templates: Record<string, string> = {
      welcome: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to VeriGrade</title>
        </head>
        <body>
          <h1>Welcome to VeriGrade, ${data['firstName']}!</h1>
          <p>Thank you for joining VeriGrade. Your organization "${data['organizationName']}" has been created successfully.</p>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${data['verificationUrl']}">Verify Email Address</a>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>The VeriGrade Team</p>
        </body>
        </html>
      `,
      passwordReset: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset - VeriGrade</title>
        </head>
        <body>
          <h1>Password Reset Request</h1>
          <p>Hello ${data['firstName']},</p>
          <p>You requested a password reset for your VeriGrade account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${data['resetUrl']}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <p>Best regards,<br>The VeriGrade Team</p>
        </body>
        </html>
      `,
      invoice: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${data['invoiceNumber']} - VeriGrade</title>
        </head>
        <body>
          <h1>Invoice ${data['invoiceNumber']}</h1>
          <p>Hello ${data['customerName']},</p>
          <p>Please find attached your invoice for ${data['totalAmount']}.</p>
          <p>Due Date: ${data['dueDate']}</p>
          <p>You can view and pay this invoice online: <a href="${data['invoiceUrl']}">View Invoice</a></p>
          <p>Thank you for your business!</p>
          <p>Best regards,<br>${data['organizationName']}</p>
        </body>
        </html>
      `,
      contactForm: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Contact Form Submission - VeriGrade</title>
        </head>
        <body>
          <h1>New Contact Form Submission</h1>
          <p><strong>Name:</strong> ${data['name']}</p>
          <p><strong>Email:</strong> ${data['email']}</p>
          <p><strong>Phone:</strong> ${data['phone']}</p>
          <p><strong>Message:</strong></p>
          <p>${data['message']}</p>
          <p><strong>Submitted:</strong> ${data['timestamp']}</p>
          <hr>
          <p>Please respond to this inquiry within one business day.</p>
        </body>
        </html>
      `,
      contactAutoReply: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Thank you for contacting VeriGrade</title>
        </head>
        <body>
          <h1>Thank you for contacting VeriGrade Bookkeeping!</h1>
          <p>Hello ${data['name']},</p>
          <p>We have received your message and appreciate you reaching out to us.</p>
          <p>Our team will review your inquiry and get back to you within one business day.</p>
          <p>In the meantime, feel free to explore our services at <a href="https://www.verigradebookkeeping.com">www.verigradebookkeeping.com</a></p>
          <p>Best regards,<br>The VeriGrade Team</p>
        </body>
        </html>
      `,
    };

    return templates[template] || '<p>Template not found</p>';
  }

  private generateTextTemplate(template: string, data: Record<string, any>): string {
    const templates: Record<string, string> = {
      welcome: `
        Welcome to VeriGrade, ${data['firstName']}!
        
        Thank you for joining VeriGrade. Your organization "${data['organizationName']}" has been created successfully.
        
        Please verify your email address by visiting: ${data['verificationUrl']}
        
        If you have any questions, feel free to contact our support team.
        
        Best regards,
        The VeriGrade Team
      `,
      passwordReset: `
        Password Reset Request
        
        Hello ${data['firstName']},
        
        You requested a password reset for your VeriGrade account.
        
        Reset your password by visiting: ${data['resetUrl']}
        
        This link will expire in 1 hour.
        
        If you didn't request this reset, please ignore this email.
        
        Best regards,
        The VeriGrade Team
      `,
      invoice: `
        Invoice ${data['invoiceNumber']}
        
        Hello ${data['customerName']},
        
        Please find attached your invoice for ${data['totalAmount']}.
        
        Due Date: ${data['dueDate']}
        
        View and pay this invoice online: ${data['invoiceUrl']}
        
        Thank you for your business!
        
        Best regards,
        ${data['organizationName']}
      `,
      contactForm: `
        New Contact Form Submission
        
        Name: ${data['name']}
        Email: ${data['email']}
        Phone: ${data['phone']}
        
        Message:
        ${data['message']}
        
        Submitted: ${data['timestamp']}
        
        Please respond to this inquiry within one business day.
      `,
      contactAutoReply: `
        Thank you for contacting VeriGrade Bookkeeping!
        
        Hello ${data['name']},
        
        We have received your message and appreciate you reaching out to us.
        
        Our team will review your inquiry and get back to you within one business day.
        
        In the meantime, feel free to explore our services at www.verigradebookkeeping.com
        
        Best regards,
        The VeriGrade Team
      `,
    };

    return templates[template] || 'Template not found';
  }
}

export const emailService = new EmailService();
export const sendEmail = (options: EmailOptions) => emailService.sendEmail(options);
