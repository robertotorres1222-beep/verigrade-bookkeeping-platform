import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';

export const qualityControlController = {
  // Get QC checklists
  async getChecklists(req: AuthenticatedRequest, res: Response) {
    try {
      const { category, isActive } = req.query;

      const where: any = {};

      if (category) {
        where.category = category;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      // Mock QC checklists
      const mockChecklists = [
        {
          id: 'qc-1',
          name: 'Monthly Close Checklist',
          category: 'MONTH_END',
          description: 'Quality control checklist for monthly close process',
          items: [
            { id: 1, task: 'Reconcile all bank accounts', completed: false, required: true },
            { id: 2, task: 'Reconcile credit card accounts', completed: false, required: true },
            { id: 3, task: 'Review accounts receivable aging', completed: false, required: true },
            { id: 4, task: 'Review accounts payable aging', completed: false, required: true },
            { id: 5, task: 'Verify payroll entries', completed: false, required: true },
            { id: 6, task: 'Review fixed asset depreciation', completed: false, required: false },
            { id: 7, task: 'Verify loan payments and interest', completed: false, required: true },
            { id: 8, task: 'Review prepaid expenses', completed: false, required: false },
            { id: 9, task: 'Verify accrued expenses', completed: false, required: true },
            { id: 10, task: 'Generate and review financial statements', completed: false, required: true },
          ],
          isActive: true,
          completionRate: 0,
        },
        {
          id: 'qc-2',
          name: 'Transaction Review Checklist',
          category: 'TRANSACTION',
          description: 'Quality control for individual transaction review',
          items: [
            { id: 1, task: 'Verify transaction date is correct', completed: false, required: true },
            { id: 2, task: 'Confirm amount matches documentation', completed: false, required: true },
            { id: 3, task: 'Validate category assignment', completed: false, required: true },
            { id: 4, task: 'Check vendor/customer information', completed: false, required: true },
            { id: 5, task: 'Verify tax treatment', completed: false, required: true },
            { id: 6, task: 'Attach supporting documentation', completed: false, required: false },
            { id: 7, task: 'Add notes if needed', completed: false, required: false },
          ],
          isActive: true,
          completionRate: 0,
        },
        {
          id: 'qc-3',
          name: 'Tax Return Review Checklist',
          category: 'TAX',
          description: 'Quality control checklist for tax return preparation',
          items: [
            { id: 1, task: 'Verify all income reported', completed: false, required: true },
            { id: 2, task: 'Check all deductions claimed', completed: false, required: true },
            { id: 3, task: 'Verify taxpayer information', completed: false, required: true },
            { id: 4, task: 'Review calculations', completed: false, required: true },
            { id: 5, task: 'Check for tax credits', completed: false, required: false },
            { id: 6, task: 'Verify estimated tax payments', completed: false, required: true },
            { id: 7, task: 'Review prior year comparison', completed: false, required: false },
            { id: 8, task: 'Attach all required forms', completed: false, required: true },
            { id: 9, task: 'Client signature obtained', completed: false, required: true },
          ],
          isActive: true,
          completionRate: 0,
        },
      ];

      const filteredChecklists = mockChecklists.filter(checklist => {
        if (category && checklist.category !== category) return false;
        if (isActive !== undefined && checklist.isActive !== (isActive === 'true')) return false;
        return true;
      });

      return res.json({ checklists: filteredChecklists });
    } catch (error: any) {
      console.error('Get QC checklists error:', error);
      return res.status(500).json({ error: 'Failed to get QC checklists' });
    }
  },

  // Start QC review
  async startReview(req: AuthenticatedRequest, res: Response) {
    try {
      const { checklistId, itemId, itemType } = req.body;

      if (!checklistId || !itemId || !itemType) {
        return res.status(400).json({ error: 'Checklist ID, item ID, and item type are required' });
      }

      const review = await prisma.qcReview.create({
        data: {
          checklistId,
          itemId,
          itemType,
          reviewerId: req.user!.id,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });

      return res.status(201).json({
        message: 'QC review started',
        review,
      });
    } catch (error: any) {
      console.error('Start QC review error:', error);
      return res.status(500).json({ error: 'Failed to start QC review' });
    }
  },

  // Update checklist item
  async updateChecklistItem(req: AuthenticatedRequest, res: Response) {
    try {
      const { reviewId, itemId } = req.params;
      const { completed, notes } = req.body;

      const review = await prisma.qcReview.findUnique({
        where: { id: reviewId },
      });

      if (!review) {
        return res.status(404).json({ error: 'QC review not found' });
      }

      // Update checklist progress
      const updatedReview = await prisma.qcReview.update({
        where: { id: reviewId },
        data: {
          checklistProgress: {
            ...review.checklistProgress,
            [itemId]: { completed, notes, completedAt: completed ? new Date() : null },
          },
          updatedAt: new Date(),
        },
      });

      return res.json({
        message: 'Checklist item updated',
        review: updatedReview,
      });
    } catch (error: any) {
      console.error('Update checklist item error:', error);
      return res.status(500).json({ error: 'Failed to update checklist item' });
    }
  },

  // Complete QC review
  async completeReview(req: AuthenticatedRequest, res: Response) {
    try {
      const { reviewId } = req.params;
      const { outcome, overallNotes } = req.body;

      if (!['PASS', 'FAIL', 'NEEDS_REVISION'].includes(outcome)) {
        return res.status(400).json({ error: 'Invalid outcome' });
      }

      const review = await prisma.qcReview.update({
        where: { id: reviewId },
        data: {
          status: 'COMPLETED',
          outcome,
          overallNotes,
          completedAt: new Date(),
        },
      });

      return res.json({
        message: 'QC review completed',
        review,
      });
    } catch (error: any) {
      console.error('Complete QC review error:', error);
      return res.status(500).json({ error: 'Failed to complete QC review' });
    }
  },

  // Get QC statistics
  async getQCStatistics(req: AuthenticatedRequest, res: Response) {
    try {
      const { practiceId, startDate, endDate } = req.query;

      // Mock statistics
      const statistics = {
        totalReviews: 125,
        completedReviews: 110,
        inProgressReviews: 10,
        pendingReviews: 5,
        passRate: 92.5,
        averageReviewTime: 0.75, // hours
        reviewsByCategory: {
          'MONTH_END': 35,
          'TRANSACTION': 60,
          'TAX': 20,
          'INVOICE': 10,
        },
        reviewsByOutcome: {
          'PASS': 102,
          'FAIL': 3,
          'NEEDS_REVISION': 5,
        },
        topReviewers: [
          {
            userId: 'user-1',
            name: 'Sarah Johnson',
            reviews: 45,
            passRate: 95.5,
          },
          {
            userId: 'user-2',
            name: 'Mike Chen',
            reviews: 38,
            passRate: 91.2,
          },
        ],
      };

      return res.json({ statistics });
    } catch (error: any) {
      console.error('Get QC statistics error:', error);
      return res.status(500).json({ error: 'Failed to get QC statistics' });
    }
  },
};

