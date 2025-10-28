import { Request, Response } from 'express';
import { InvestorReportingService } from '../services/investorReportingService';
import { z } from 'zod';

const investorReportingService = new InvestorReportingService();

// Validation schemas
const companyIdSchema = z.object({
  companyId: z.string().uuid()
});

const reportIdSchema = z.object({
  reportId: z.string()
});

const generateReportSchema = z.object({
  companyId: z.string().uuid(),
  reportType: z.enum(['monthly', 'quarterly', 'annual']).default('monthly'),
  customizations: z.object({
    includeSlides: z.array(z.string()).optional(),
    excludeSlides: z.array(z.string()).optional(),
    branding: z.object({
      logo: z.string().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional()
    }).optional()
  }).optional()
});

const scheduleDeliverySchema = z.object({
  companyId: z.string().uuid(),
  emailAddresses: z.array(z.string().email()),
  frequency: z.enum(['monthly', 'quarterly', 'annual']).default('monthly')
});

/**
 * Generate investor report
 */
export const generateInvestorReport = async (req: Request, res: Response) => {
  try {
    const { companyId, reportType, customizations } = generateReportSchema.parse(req.body);

    const report = await investorReportingService.generateInvestorReport(
      companyId,
      reportType,
      customizations
    );

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }

    console.error('Generate investor report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate investor report'
    });
  }
};

/**
 * Get investor report
 */
export const getInvestorReport = async (req: Request, res: Response) => {
  try {
    const { reportId } = reportIdSchema.parse(req.params);

    const report = await investorReportingService.getReport(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID',
        errors: error.errors
      });
    }

    console.error('Get investor report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get investor report'
    });
  }
};

/**
 * Generate PowerPoint presentation
 */
export const generatePowerPoint = async (req: Request, res: Response) => {
  try {
    const { reportId } = reportIdSchema.parse(req.params);

    const pptxBuffer = await investorReportingService.generatePowerPoint(reportId);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="investor-report-${reportId}.pptx"`);
    res.send(pptxBuffer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID',
        errors: error.errors
      });
    }

    console.error('Generate PowerPoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PowerPoint presentation'
    });
  }
};

/**
 * Generate PDF version
 */
export const generatePDF = async (req: Request, res: Response) => {
  try {
    const { reportId } = reportIdSchema.parse(req.params);

    const pdfBuffer = await investorReportingService.generatePDF(reportId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="investor-report-${reportId}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID',
        errors: error.errors
      });
    }

    console.error('Generate PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF'
    });
  }
};

/**
 * Generate Google Slides
 */
export const generateGoogleSlides = async (req: Request, res: Response) => {
  try {
    const { reportId } = reportIdSchema.parse(req.params);

    const slidesUrl = await investorReportingService.generateGoogleSlides(reportId);

    res.json({
      success: true,
      data: { url: slidesUrl }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID',
        errors: error.errors
      });
    }

    console.error('Generate Google Slides error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Google Slides'
    });
  }
};

/**
 * Generate one-page summary
 */
export const generateOnePageSummary = async (req: Request, res: Response) => {
  try {
    const { reportId } = reportIdSchema.parse(req.params);

    const summaryBuffer = await investorReportingService.generateOnePageSummary(reportId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="investor-summary-${reportId}.pdf"`);
    res.send(summaryBuffer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID',
        errors: error.errors
      });
    }

    console.error('Generate one-page summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate one-page summary'
    });
  }
};

/**
 * Schedule monthly report delivery
 */
export const scheduleMonthlyDelivery = async (req: Request, res: Response) => {
  try {
    const { companyId, emailAddresses, frequency } = scheduleDeliverySchema.parse(req.body);

    await investorReportingService.scheduleMonthlyDelivery(companyId, emailAddresses);

    res.json({
      success: true,
      message: 'Monthly delivery scheduled successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }

    console.error('Schedule monthly delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule monthly delivery'
    });
  }
};

/**
 * Get slide templates
 */
export const getSlideTemplates = async (req: Request, res: Response) => {
  try {
    const templates = [
      {
        id: 'executive_summary',
        name: 'Executive Summary',
        description: 'Company overview and key metrics',
        required: true
      },
      {
        id: 'financials',
        name: 'Financial Performance',
        description: 'Revenue, MRR, and financial metrics',
        required: true
      },
      {
        id: 'growth',
        name: 'Growth Metrics',
        description: 'Customer growth and retention',
        required: true
      },
      {
        id: 'unit_economics',
        name: 'Unit Economics',
        description: 'LTV, CAC, and unit economics',
        required: true
      },
      {
        id: 'cash_flow',
        name: 'Cash Flow & Runway',
        description: 'Cash position and runway analysis',
        required: true
      },
      {
        id: 'wins',
        name: 'Key Wins',
        description: 'Recent achievements and milestones',
        required: false
      },
      {
        id: 'challenges',
        name: 'Challenges',
        description: 'Current challenges and solutions',
        required: false
      },
      {
        id: 'customers',
        name: 'Customer Success',
        description: 'Customer stories and testimonials',
        required: false
      },
      {
        id: 'roadmap',
        name: 'Product Roadmap',
        description: 'Product development timeline',
        required: false
      },
      {
        id: 'team',
        name: 'Team & Culture',
        description: 'Team composition and culture',
        required: false
      },
      {
        id: 'ask',
        name: 'Funding Ask',
        description: 'Funding requirements and use of funds',
        required: false
      }
    ];

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Get slide templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get slide templates'
    });
  }
};

/**
 * Get company reports
 */
export const getCompanyReports = async (req: Request, res: Response) => {
  try {
    const { companyId } = companyIdSchema.parse(req.params);
    const { limit = 10, offset = 0 } = req.query;

    const reports = await investorReportingService.getCompanyReports(
      companyId,
      Number(limit),
      Number(offset)
    );

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID',
        errors: error.errors
      });
    }

    console.error('Get company reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get company reports'
    });
  }
};









