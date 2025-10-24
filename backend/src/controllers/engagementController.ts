import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';

export const engagementController = {
  // Create engagement letter
  async createEngagementLetter(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        clientId,
        serviceType,
        scope,
        deliverables,
        fees,
        terms,
        startDate,
        endDate,
        isActive = true,
      } = req.body;

      if (!clientId || !serviceType || !scope) {
        return res.status(400).json({ error: 'Client ID, service type, and scope are required' });
      }

      const engagementLetter = await prisma.engagementLetter.create({
        data: {
          organizationId: req.user!.organizationId,
          practiceId: req.body.practiceId,
          clientId,
          serviceType,
          scope,
          deliverables,
          fees,
          terms,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          isActive,
          createdBy: req.user!.id,
        },
      });

      return res.status(201).json({
        message: 'Engagement letter created successfully',
        engagementLetter,
      });
    } catch (error: any) {
      console.error('Create engagement letter error:', error);
      return res.status(500).json({ error: 'Failed to create engagement letter' });
    }
  },

  // Get engagement letters
  async getEngagementLetters(req: AuthenticatedRequest, res: Response) {
    try {
      const { clientId, serviceType, status, isActive, page = 1, limit = 20 } = req.query;

      const where: any = {
        organizationId: req.user!.organizationId,
      };

      if (clientId) {
        where.clientId = clientId;
      }

      if (serviceType) {
        where.serviceType = serviceType;
      }

      if (status) {
        where.status = status;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      // Mock engagement letters
      const mockLetters = [
        {
          id: 'letter-1',
          clientId: 'client-1',
          clientName: 'TechStart Inc',
          serviceType: 'BOOKKEEPING',
          scope: 'Monthly bookkeeping and financial reporting',
          deliverables: ['Monthly financial statements', 'Bank reconciliation', 'Tax preparation'],
          fees: {
            monthly: 1500.00,
            setup: 500.00,
            hourly: 150.00,
          },
          status: 'ACTIVE',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          isActive: true,
          signedAt: '2024-01-05T10:00:00Z',
        },
        {
          id: 'letter-2',
          clientId: 'client-2',
          clientName: 'ABC Consulting',
          serviceType: 'TAX_PREPARATION',
          scope: 'Annual tax preparation and planning',
          deliverables: ['Individual tax returns', 'Business tax returns', 'Tax planning'],
          fees: {
            individual: 800.00,
            business: 1200.00,
            planning: 500.00,
          },
          status: 'PENDING_SIGNATURE',
          startDate: '2024-01-15',
          endDate: '2024-12-31',
          isActive: true,
          sentAt: '2024-01-10T14:30:00Z',
        },
        {
          id: 'letter-3',
          clientId: 'client-3',
          clientName: 'XYZ Corp',
          serviceType: 'ADVISORY',
          scope: 'Financial advisory and business consulting',
          deliverables: ['Financial analysis', 'Business planning', 'KPI monitoring'],
          fees: {
            monthly: 2500.00,
            project: 5000.00,
            hourly: 200.00,
          },
          status: 'EXPIRED',
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          isActive: false,
          signedAt: '2023-01-05T09:00:00Z',
        },
      ];

      const filteredLetters = mockLetters.filter(letter => {
        if (clientId && letter.clientId !== clientId) return false;
        if (serviceType && letter.serviceType !== serviceType) return false;
        if (status && letter.status !== status) return false;
        if (isActive !== undefined && letter.isActive !== (isActive === 'true')) return false;
        return true;
      });

      return res.json({
        engagementLetters: filteredLetters,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredLetters.length,
          pages: Math.ceil(filteredLetters.length / Number(limit)),
        },
      });
    } catch (error: any) {
      console.error('Get engagement letters error:', error);
      return res.status(500).json({ error: 'Failed to get engagement letters' });
    }
  },

  // Update engagement letter
  async updateEngagementLetter(req: AuthenticatedRequest, res: Response) {
    try {
      const { letterId } = req.params;
      const updateData = req.body;

      const engagementLetter = await prisma.engagementLetter.update({
        where: { id: letterId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      return res.json({
        message: 'Engagement letter updated successfully',
        engagementLetter,
      });
    } catch (error: any) {
      console.error('Update engagement letter error:', error);
      return res.status(500).json({ error: 'Failed to update engagement letter' });
    }
  },

  // Sign engagement letter
  async signEngagementLetter(req: AuthenticatedRequest, res: Response) {
    try {
      const { letterId } = req.params;
      const { signature, signedBy } = req.body;

      if (!signature) {
        return res.status(400).json({ error: 'Signature is required' });
      }

      const engagementLetter = await prisma.engagementLetter.update({
        where: { id: letterId },
        data: {
          status: 'ACTIVE',
          signature,
          signedBy,
          signedAt: new Date(),
        },
      });

      return res.json({
        message: 'Engagement letter signed successfully',
        engagementLetter,
      });
    } catch (error: any) {
      console.error('Sign engagement letter error:', error);
      return res.status(500).json({ error: 'Failed to sign engagement letter' });
    }
  },

  // Generate engagement letter PDF
  async generateEngagementLetterPDF(req: AuthenticatedRequest, res: Response) {
    try {
      const { letterId } = req.params;

      const engagementLetter = await prisma.engagementLetter.findUnique({
        where: { id: letterId },
      });

      if (!engagementLetter) {
        return res.status(404).json({ error: 'Engagement letter not found' });
      }

      // Mock PDF generation
      const pdfResult = {
        letterId: engagementLetter.id,
        clientId: engagementLetter.clientId,
        fileName: `engagement-letter-${letterId}.pdf`,
        fileSize: 245760, // bytes
        downloadUrl: `/api/engagement-letters/${letterId}/download`,
        generatedAt: new Date(),
      };

      return res.json({
        message: 'Engagement letter PDF generated successfully',
        pdfResult,
      });
    } catch (error: any) {
      console.error('Generate engagement letter PDF error:', error);
      return res.status(500).json({ error: 'Failed to generate engagement letter PDF' });
    }
  },

  // Get engagement letter templates
  async getEngagementLetterTemplates(req: AuthenticatedRequest, res: Response) {
    try {
      const { serviceType, isActive } = req.query;

      const where: any = {};

      if (serviceType) {
        where.serviceType = serviceType;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      // Mock templates
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'Standard Bookkeeping Engagement',
          serviceType: 'BOOKKEEPING',
          description: 'Standard engagement letter for monthly bookkeeping services',
          template: {
            scope: 'Monthly bookkeeping, bank reconciliation, and financial reporting',
            deliverables: [
              'Monthly financial statements',
              'Bank reconciliation',
              'Accounts payable management',
              'Accounts receivable tracking',
            ],
            fees: {
              monthly: 1500.00,
              setup: 500.00,
              hourly: 150.00,
            },
            terms: [
              'Services to be performed monthly',
              'Client to provide all necessary documentation',
              'Fees due within 30 days of invoice',
              'Either party may terminate with 30 days notice',
            ],
          },
          isActive: true,
        },
        {
          id: 'template-2',
          name: 'Tax Preparation Engagement',
          serviceType: 'TAX_PREPARATION',
          description: 'Engagement letter for tax preparation services',
          template: {
            scope: 'Annual tax preparation and filing',
            deliverables: [
              'Individual tax returns',
              'Business tax returns',
              'Tax planning consultation',
              'IRS correspondence handling',
            ],
            fees: {
              individual: 800.00,
              business: 1200.00,
              planning: 500.00,
            },
            terms: [
              'Tax returns prepared by April 15th',
              'Client responsible for accuracy of information provided',
              'Additional fees for amended returns',
              'Engagement valid for one tax year',
            ],
          },
          isActive: true,
        },
        {
          id: 'template-3',
          name: 'Advisory Services Engagement',
          serviceType: 'ADVISORY',
          description: 'Engagement letter for financial advisory services',
          template: {
            scope: 'Financial advisory and business consulting',
            deliverables: [
              'Financial analysis and reporting',
              'Business planning and strategy',
              'KPI monitoring and analysis',
              'Quarterly business reviews',
            ],
            fees: {
              monthly: 2500.00,
              project: 5000.00,
              hourly: 200.00,
            },
            terms: [
              'Advisory services provided on ongoing basis',
              'Client to provide access to financial systems',
              'Monthly retainer covers up to 20 hours',
              'Additional hours billed at hourly rate',
            ],
          },
          isActive: true,
        },
      ];

      const filteredTemplates = mockTemplates.filter(template => {
        if (serviceType && template.serviceType !== serviceType) return false;
        if (isActive !== undefined && template.isActive !== (isActive === 'true')) return false;
        return true;
      });

      return res.json({ templates: filteredTemplates });
    } catch (error: any) {
      console.error('Get engagement letter templates error:', error);
      return res.status(500).json({ error: 'Failed to get engagement letter templates' });
    }
  },

  // Get engagement statistics
  async getEngagementStatistics(req: AuthenticatedRequest, res: Response) {
    try {
      const { practiceId, startDate, endDate } = req.query;

      // Mock statistics
      const statistics = {
        totalEngagements: 85,
        activeEngagements: 65,
        pendingSignatures: 8,
        expiredEngagements: 12,
        engagementsByService: {
          'BOOKKEEPING': 35,
          'TAX_PREPARATION': 25,
          'ADVISORY': 15,
          'AUDIT': 10,
        },
        engagementsByStatus: {
          'ACTIVE': 65,
          'PENDING_SIGNATURE': 8,
          'EXPIRED': 12,
        },
        averageEngagementValue: 1850.00,
        totalEngagementValue: 157250.00,
        renewalRate: 78.5, // percentage
        topPerformingServices: [
          {
            serviceType: 'BOOKKEEPING',
            count: 35,
            averageValue: 1500.00,
            renewalRate: 85.7,
          },
          {
            serviceType: 'ADVISORY',
            count: 15,
            averageValue: 2500.00,
            renewalRate: 93.3,
          },
        ],
      };

      return res.json({ statistics });
    } catch (error: any) {
      console.error('Get engagement statistics error:', error);
      return res.status(500).json({ error: 'Failed to get engagement statistics' });
    }
  },
};

