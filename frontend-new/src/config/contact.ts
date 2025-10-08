// VeriGrade Contact Information Configuration
export const contactInfo = {
  // Main Contact Email
  email: {
    general: 'hello@verigradebookkeeping.com',
    support: 'support@verigradebookkeeping.com',
    security: 'security@verigradebookkeeping.com',
    sales: 'sales@verigradebookkeeping.com',
    billing: 'billing@verigradebookkeeping.com',
    partnerships: 'partnerships@verigradebookkeeping.com',
    press: 'press@verigradebookkeeping.com',
    careers: 'careers@verigradebookkeeping.com'
  },

  // Phone Numbers
  phone: {
    main: '1-800-VERIGRADE',
    support: '1-800-VERI-SUPPORT',
    sales: '1-800-VERI-SALES'
  },

  // Office Address
  address: {
    street: '123 Business Ave',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    country: 'United States'
  },

  // Business Hours
  hours: {
    support: 'Mon-Fri 9AM-6PM EST',
    sales: 'Mon-Fri 8AM-8PM EST',
    emergency: '24/7 for critical issues'
  },

  // Social Media & Links
  social: {
    linkedin: 'https://linkedin.com/company/verigrade',
    twitter: 'https://twitter.com/verigrade',
    facebook: 'https://facebook.com/verigrade',
    youtube: 'https://youtube.com/verigrade'
  },

  // Response Times
  response: {
    email: 'Within 24 hours',
    phone: 'Immediate during business hours',
    chat: 'Within 2 minutes',
    emergency: 'Within 1 hour'
  }
};

// Email Templates for Different Purposes
export const emailTemplates = {
  support: {
    subject: 'VeriGrade Support Request',
    body: `Hi VeriGrade Support Team,

I need help with:

[Please describe your issue here]

User Information:
- Name: [Your Name]
- Email: [Your Email]
- Plan: [Your Plan]
- Issue Priority: [Low/Medium/High/Critical]

Best regards,
[Your Name]`
  },

  sales: {
    subject: 'Interested in VeriGrade Services',
    body: `Hi VeriGrade Sales Team,

I'm interested in learning more about VeriGrade's bookkeeping services.

Company Information:
- Company Name: [Your Company]
- Industry: [Your Industry]
- Number of Employees: [Number]
- Current Bookkeeping Solution: [Current Solution]
- Budget Range: [Budget Range]
- Timeline: [When do you need to start?]

Specific Needs:
[Please describe what you're looking for]

Best regards,
[Your Name]
[Your Title]
[Your Company]`
  },

  security: {
    subject: 'Security Concern - VeriGrade',
    body: `Hi VeriGrade Security Team,

I have identified a potential security issue:

Issue Type: [Bug/Privacy Concern/Data Breach/Other]
Severity: [Low/Medium/High/Critical]
Description: [Detailed description of the issue]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Additional Information:
[Any additional context]

Best regards,
[Your Name]
[Your Contact Information]`
  }
};

// Contact Form Fields
export const contactFormFields = {
  services: [
    { value: 'bookkeeping', label: 'Professional Bookkeeping' },
    { value: 'tax', label: 'Tax Preparation & Filing' },
    { value: 'payroll', label: 'Payroll Management' },
    { value: 'consulting', label: 'Financial Consulting' },
    { value: 'enterprise', label: 'Enterprise Solutions' },
    { value: 'integration', label: 'Custom Integrations' },
    { value: 'training', label: 'Training & Support' },
    { value: 'other', label: 'Other' }
  ],

  industries: [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'construction', label: 'Construction' },
    { value: 'professional', label: 'Professional Services' },
    { value: 'nonprofit', label: 'Non-profit' },
    { value: 'other', label: 'Other' }
  ],

  companySize: [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-1000', label: '201-1000 employees' },
    { value: '1000+', label: '1000+ employees' }
  ],

  budget: [
    { value: 'under-500', label: 'Under $500/month' },
    { value: '500-1000', label: '$500-$1,000/month' },
    { value: '1000-2500', label: '$1,000-$2,500/month' },
    { value: '2500-5000', label: '$2,500-$5,000/month' },
    { value: '5000+', label: '$5,000+/month' },
    { value: 'custom', label: 'Custom Enterprise Pricing' }
  ]
};

