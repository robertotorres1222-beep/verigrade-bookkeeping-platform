import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  template?: 'welcome' | 'passwordReset' | 'invoice' | 'contactForm' | 'contactAutoReply' | 'paymentConfirmation' | 'newSubscription' | 'demoConfirmation' | 'demoNotification' | 'bankingApplication' | 'bankingApplicationNotification' | 'transferConfirmation' | 'advisorSessionConfirmation' | 'advisorSessionNotification' | 'taxDocumentUploaded' | 'taxFilingConfirmation' | 'taxFilingRequest' | 'employeeWelcome' | 'payrollNotification' | 'creditCardApplication' | 'creditLimitIncrease' | 'billApprovalRequired' | 'billApprovalNotification' | 'reimbursementApprovalRequired' | 'inventoryLowStock' | 'mileageApprovalRequired' | 'projectCompleted' | 'projectMilestone' | 'timesheetSubmitted';
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
          paymentConfirmation: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Payment Confirmed - Welcome to VeriGrade</title>
            </head>
            <body>
              <h1>Welcome to VeriGrade, ${data['name']}!</h1>
              <p>Your payment has been processed successfully.</p>
              <h2>Subscription Details:</h2>
              <ul>
                <li><strong>Plan:</strong> ${data['plan']}</li>
                <li><strong>Billing Period:</strong> ${data['billingPeriod']}</li>
                <li><strong>Amount:</strong> $${data['amount']}</li>
                <li><strong>Payment ID:</strong> ${data['paymentIntentId']}</li>
                <li><strong>Company:</strong> ${data['company']}</li>
              </ul>
              <p>Your account is now active and ready to use. You can log in to your dashboard to get started.</p>
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
              <p>Best regards,<br>The VeriGrade Team</p>
            </body>
            </html>
          `,
          newSubscription: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>New Subscription - ${data['name']}</title>
            </head>
            <body>
              <h1>New Subscription Alert</h1>
              <p>A new customer has subscribed to VeriGrade:</p>
              <h2>Customer Details:</h2>
              <ul>
                <li><strong>Name:</strong> ${data['name']}</li>
                <li><strong>Email:</strong> ${data['email']}</li>
                <li><strong>Company:</strong> ${data['company']}</li>
                <li><strong>Plan:</strong> ${data['plan']}</li>
                <li><strong>Billing Period:</strong> ${data['billingPeriod']}</li>
                <li><strong>Amount:</strong> $${data['amount']}</li>
                <li><strong>Timestamp:</strong> ${data['timestamp']}</li>
              </ul>
              <p>Please follow up with the customer to ensure a smooth onboarding experience.</p>
            </body>
            </html>
          `,
          demoConfirmation: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Demo Confirmed - VeriGrade Bookkeeping</title>
            </head>
            <body>
              <h1>Demo Confirmed - VeriGrade Bookkeeping</h1>
              <p>Hello ${data['name']},</p>
              <p>Thank you for scheduling a demo with VeriGrade! We're excited to show you how our AI-powered bookkeeping platform can transform your business.</p>
              <h2>Demo Details:</h2>
              <ul>
                <li><strong>Company:</strong> ${data['company']}</li>
                <li><strong>Date:</strong> ${data['preferredDate']}</li>
                <li><strong>Time:</strong> ${data['preferredTime']}</li>
                <li><strong>Demo ID:</strong> ${data['demoId']}</li>
                <li><strong>Duration:</strong> 30 minutes</li>
              </ul>
              <p>We'll send you a calendar invite shortly with the meeting link. In the meantime, feel free to explore our website and prepare any questions you might have.</p>
              <p>If you need to reschedule or have any questions, please contact us at (555) 123-4567 or support@verigrade.com</p>
              <p>Best regards,<br>The VeriGrade Team</p>
            </body>
            </html>
          `,
          demoNotification: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>New Demo Scheduled - ${data['name']}</title>
            </head>
            <body>
              <h1>New Demo Scheduled</h1>
              <p>A new demo has been scheduled:</p>
              <h2>Customer Details:</h2>
              <ul>
                <li><strong>Name:</strong> ${data['name']}</li>
                <li><strong>Email:</strong> ${data['email']}</li>
                <li><strong>Company:</strong> ${data['company']}</li>
                <li><strong>Phone:</strong> ${data['phone']}</li>
                <li><strong>Preferred Date:</strong> ${data['preferredDate']}</li>
                <li><strong>Preferred Time:</strong> ${data['preferredTime']}</li>
                <li><strong>Demo ID:</strong> ${data['demoId']}</li>
                <li><strong>Message:</strong> ${data['message']}</li>
                <li><strong>Scheduled:</strong> ${data['timestamp']}</li>
              </ul>
              <p>Please prepare for this demo and follow up with the customer to confirm the appointment.</p>
            </body>
            </html>
          `,
          bankingApplication: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Business Banking Application Received - VeriGrade</title>
            </head>
            <body>
              <h1>Business Banking Application Received</h1>
              <p>Hello,</p>
              <p>Thank you for applying for a VeriGrade Business Banking account for <strong>${data['businessName']}</strong>.</p>
              <h2>Application Details:</h2>
              <ul>
                <li><strong>Application ID:</strong> ${data['applicationId']}</li>
                <li><strong>Business Name:</strong> ${data['businessName']}</li>
                <li><strong>Processing Time:</strong> ${data['expectedProcessingTime']}</li>
              </ul>
              <p>Our banking team will review your application and contact you within the next business day to discuss next steps.</p>
              <p>You'll receive up to $3,000,000 in FDIC insurance and earn up to 3.34% APY on your deposits.</p>
              <p>Best regards,<br>The VeriGrade Banking Team</p>
            </body>
            </html>
          `,
          advisorSessionConfirmation: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Advisor Session Confirmed - VeriGrade</title>
            </head>
            <body>
              <h1>Advisor Session Confirmed</h1>
              <p>Your advisor session has been successfully booked!</p>
              <h2>Session Details:</h2>
              <ul>
                <li><strong>Advisor:</strong> ${data['advisorName']}</li>
                <li><strong>Session Type:</strong> ${data['sessionType']}</li>
                <li><strong>Duration:</strong> ${data['duration']} minutes</li>
                <li><strong>Date:</strong> ${data['preferredDate']}</li>
                <li><strong>Time:</strong> ${data['preferredTime']}</li>
                <li><strong>Total Cost:</strong> $${data['totalCost']}</li>
                <li><strong>Session ID:</strong> ${data['sessionId']}</li>
              </ul>
              <p><strong>Meeting Link:</strong> <a href="${data['meetingLink']}">${data['meetingLink']}</a></p>
              <p>We'll send you a reminder 24 hours before your session.</p>
              <p>Best regards,<br>The VeriGrade Team</p>
            </body>
            </html>
          `,
          taxFilingConfirmation: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Tax Filing Request Confirmed - VeriGrade</title>
            </head>
            <body>
              <h1>Tax Filing Request Confirmed</h1>
              <p>Your tax filing request has been received and is being processed.</p>
              <h2>Filing Details:</h2>
              <ul>
                <li><strong>Filing ID:</strong> ${data['filingId']}</li>
                <li><strong>Filing Type:</strong> ${data['filingType']}</li>
                <li><strong>Tax Year:</strong> ${data['taxYear']}</li>
                <li><strong>Preferred Filing Date:</strong> ${data['preferredFilingDate']}</li>
                <li><strong>Estimated Completion:</strong> ${data['estimatedCompletionTime']}</li>
                <li><strong>Extensions Included:</strong> ${data['includeExtensions'] ? 'Yes' : 'No'}</li>
              </ul>
              <p>Our tax team will review your documents and prepare your return. You'll receive updates as we progress.</p>
              <p>Best regards,<br>The VeriGrade Tax Team</p>
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
          paymentConfirmation: `
            Welcome to VeriGrade, ${data['name']}!
            
            Your payment has been processed successfully.
            
            Subscription Details:
            - Plan: ${data['plan']}
            - Billing Period: ${data['billingPeriod']}
            - Amount: $${data['amount']}
            - Payment ID: ${data['paymentIntentId']}
            - Company: ${data['company']}
            
            Your account is now active and ready to use. You can log in to your dashboard to get started.
            
            If you have any questions, please don't hesitate to contact our support team.
            
            Best regards,
            The VeriGrade Team
          `,
          newSubscription: `
            New Subscription Alert
            
            A new customer has subscribed to VeriGrade:
            
            Customer Details:
            - Name: ${data['name']}
            - Email: ${data['email']}
            - Company: ${data['company']}
            - Plan: ${data['plan']}
            - Billing Period: ${data['billingPeriod']}
            - Amount: $${data['amount']}
            - Timestamp: ${data['timestamp']}
            
            Please follow up with the customer to ensure a smooth onboarding experience.
          `,
          demoConfirmation: `
            Demo Confirmed - VeriGrade Bookkeeping
            
            Hello ${data['name']},
            
            Thank you for scheduling a demo with VeriGrade! We're excited to show you how our AI-powered bookkeeping platform can transform your business.
            
            Demo Details:
            - Company: ${data['company']}
            - Date: ${data['preferredDate']}
            - Time: ${data['preferredTime']}
            - Demo ID: ${data['demoId']}
            - Duration: 30 minutes
            
            We'll send you a calendar invite shortly with the meeting link. In the meantime, feel free to explore our website and prepare any questions you might have.
            
            If you need to reschedule or have any questions, please contact us at (555) 123-4567 or support@verigrade.com
            
            Best regards,
            The VeriGrade Team
          `,
          demoNotification: `
            New Demo Scheduled - ${data['name']}
            
            A new demo has been scheduled:
            
            Customer Details:
            - Name: ${data['name']}
            - Email: ${data['email']}
            - Company: ${data['company']}
            - Phone: ${data['phone']}
            - Preferred Date: ${data['preferredDate']}
            - Preferred Time: ${data['preferredTime']}
            - Demo ID: ${data['demoId']}
            - Message: ${data['message']}
            - Scheduled: ${data['timestamp']}
            
            Please prepare for this demo and follow up with the customer to confirm the appointment.
          `,
    employeeWelcome: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to VeriGrade Payroll - ${data['firstName']} ${data['lastName']}</title>
      </head>
      <body>
        <h1>Welcome to VeriGrade Payroll System</h1>
        <p>Hello ${data['firstName']},</p>
        <p>Welcome to the VeriGrade payroll system! You've been successfully added as an employee.</p>
        <h2>Your Details:</h2>
        <ul>
          <li><strong>Name:</strong> ${data['firstName']} ${data['lastName']}</li>
          <li><strong>Position:</strong> ${data['position']}</li>
          <li><strong>Company:</strong> ${data['company']}</li>
        </ul>
        <p>You can access your payroll portal at: <a href="${data['payrollPortalUrl']}">${data['payrollPortalUrl']}</a></p>
        <p>Best regards,<br>The VeriGrade Payroll Team</p>
      </body>
      </html>
    `,
    payrollNotification: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Paystub is Ready - ${data['firstName']}</title>
      </head>
      <body>
        <h1>Your Paystub is Ready</h1>
        <p>Hello ${data['firstName']},</p>
        <p>Your paystub for ${data['payPeriod']} is now available.</p>
        <h2>Payment Details:</h2>
        <ul>
          <li><strong>Pay Period:</strong> ${data['payPeriod']}</li>
          <li><strong>Pay Date:</strong> ${data['payDate']}</li>
          <li><strong>Net Pay:</strong> $${data['netPay']}</li>
        </ul>
        <p>View your detailed paystub at: <a href="${data['payrollPortalUrl']}">${data['payrollPortalUrl']}</a></p>
        <p>Best regards,<br>The VeriGrade Payroll Team</p>
      </body>
      </html>
    `,
    creditCardApplication: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Business Credit Card Application Received - ${data['businessName']}</title>
      </head>
      <body>
        <h1>Business Credit Card Application Received</h1>
        <p>Thank you for applying for a VeriGrade Business Credit Card for <strong>${data['businessName']}</strong>.</p>
        <h2>Application Details:</h2>
        <ul>
          <li><strong>Business Name:</strong> ${data['businessName']}</li>
          <li><strong>Requested Credit Limit:</strong> $${data['requestedCreditLimit']}</li>
          <li><strong>Application ID:</strong> ${data['applicationId']}</li>
          <li><strong>Estimated Decision Date:</strong> ${data['estimatedDecisionDate']}</li>
        </ul>
        <p>Our team will review your application and notify you of the decision within the estimated timeframe.</p>
        <p>Best regards,<br>The VeriGrade Credit Team</p>
      </body>
      </html>
    `,
    creditLimitIncrease: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Credit Limit Increase Request Received - ${data['cardNumber']}</title>
      </head>
      <body>
        <h1>Credit Limit Increase Request Received</h1>
        <p>Your credit limit increase request has been submitted for review.</p>
        <h2>Request Details:</h2>
        <ul>
          <li><strong>Card Number:</strong> ${data['cardNumber']}</li>
          <li><strong>Current Limit:</strong> $${data['currentLimit']}</li>
          <li><strong>Requested Limit:</strong> $${data['requestedLimit']}</li>
          <li><strong>Estimated Decision Date:</strong> ${data['estimatedDecisionDate']}</li>
        </ul>
        <p>We'll notify you once a decision has been made on your request.</p>
        <p>Best regards,<br>The VeriGrade Credit Team</p>
      </body>
      </html>
    `,
    billApprovalRequired: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bill Approval Required - ${data['vendor']} - $${data['amount']}</title>
      </head>
      <body>
        <h1>Bill Approval Required</h1>
        <p>A bill requires your approval before payment can be processed.</p>
        <h2>Bill Details:</h2>
        <ul>
          <li><strong>Vendor:</strong> ${data['vendor']}</li>
          <li><strong>Amount:</strong> $${data['amount']}</li>
          <li><strong>Invoice Number:</strong> ${data['invoiceNumber']}</li>
          <li><strong>Due Date:</strong> ${data['dueDate']}</li>
          <li><strong>Description:</strong> ${data['description']}</li>
        </ul>
        <p>Please review and approve this bill: <a href="${data['approvalUrl']}">${data['approvalUrl']}</a></p>
        <p>Best regards,<br>The VeriGrade Finance Team</p>
      </body>
      </html>
    `,
    billApprovalNotification: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bill ${data['action']} - ${data['billId']}</title>
      </head>
      <body>
        <h1>Bill ${data['action']}</h1>
        <p>Your bill has been ${data['action'] === 'APPROVE' ? 'approved' : 'rejected'}.</p>
        <h2>Bill Details:</h2>
        <ul>
          <li><strong>Bill ID:</strong> ${data['billId']}</li>
          <li><strong>Status:</strong> ${data['action']}</li>
          <li><strong>Approver:</strong> ${data['approver']}</li>
          <li><strong>Reason:</strong> ${data['reason'] || 'N/A'}</li>
        </ul>
        <p><strong>Next Steps:</strong> ${data['nextSteps']}</p>
        <p>Best regards,<br>The VeriGrade Finance Team</p>
      </body>
      </html>
    `,
    reimbursementApprovalRequired: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Expense Reimbursement Approval Required - ${data['employeeName']} - $${data['amount']}</title>
      </head>
      <body>
        <h1>Expense Reimbursement Approval Required</h1>
        <p>An expense reimbursement requires your approval.</p>
        <h2>Reimbursement Details:</h2>
        <ul>
          <li><strong>Employee:</strong> ${data['employeeName']}</li>
          <li><strong>Amount:</strong> $${data['amount']}</li>
          <li><strong>Category:</strong> ${data['category']}</li>
          <li><strong>Merchant:</strong> ${data['merchant']}</li>
          <li><strong>Date:</strong> ${data['expenseDate']}</li>
          <li><strong>Description:</strong> ${data['description']}</li>
        </ul>
        <p>Please review and approve this reimbursement: <a href="${data['approvalUrl']}">${data['approvalUrl']}</a></p>
        <p>Best regards,<br>The VeriGrade Finance Team</p>
      </body>
      </html>
    `,
    };

    return templates[template] || 'Template not found';
  }
}

export const emailService = new EmailService();
export const sendEmail = (options: EmailOptions) => emailService.sendEmail(options);
