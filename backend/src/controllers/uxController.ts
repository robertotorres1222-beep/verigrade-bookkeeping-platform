import { Request, Response } from 'express';
import { uxService } from '../services/uxService';
import logger from '../utils/logger';

export class UXController {
  // Onboarding Wizard
  async startOnboarding(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      const onboarding = await uxService.startOnboarding(userId);
      res.json({ success: true, data: onboarding, message: 'Onboarding started successfully' });
    } catch (error) {
      logger.error('Error starting onboarding', { error });
      res.status(500).json({ success: false, message: 'Failed to start onboarding' });
    }
  }

  async completeOnboardingStep(req: Request, res: Response): Promise<void> {
    try {
      const { userId, stepId, data } = req.body;
      await uxService.completeOnboardingStep(userId, stepId, data);
      res.json({ success: true, message: 'Onboarding step completed successfully' });
    } catch (error) {
      logger.error('Error completing onboarding step', { error });
      res.status(500).json({ success: false, message: 'Failed to complete onboarding step' });
    }
  }

  async getOnboardingStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.query;
      const status = await uxService.getOnboardingStatus(userId as string);
      res.json({ success: true, data: status, message: 'Onboarding status retrieved successfully' });
    } catch (error) {
      logger.error('Error getting onboarding status', { error });
      res.status(500).json({ success: false, message: 'Failed to get onboarding status' });
    }
  }

  // Product Tours
  async startProductTour(req: Request, res: Response): Promise<void> {
    try {
      const { userId, tourId } = req.body;
      const tour = await uxService.startProductTour(userId, tourId);
      res.json({ success: true, data: tour, message: 'Product tour started successfully' });
    } catch (error) {
      logger.error('Error starting product tour', { error });
      res.status(500).json({ success: false, message: 'Failed to start product tour' });
    }
  }

  async completeProductTour(req: Request, res: Response): Promise<void> {
    try {
      const { userId, tourId } = req.body;
      await uxService.completeProductTour(userId, tourId);
      res.json({ success: true, message: 'Product tour completed successfully' });
    } catch (error) {
      logger.error('Error completing product tour', { error });
      res.status(500).json({ success: false, message: 'Failed to complete product tour' });
    }
  }

  async getAvailableTours(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.query;
      const tours = await uxService.getAvailableTours(userId as string);
      res.json({ success: true, data: tours, message: 'Available tours retrieved successfully' });
    } catch (error) {
      logger.error('Error getting available tours', { error });
      res.status(500).json({ success: false, message: 'Failed to get available tours' });
    }
  }

  // Keyboard Shortcuts
  async getKeyboardShortcuts(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.query;
      const shortcuts = await uxService.getKeyboardShortcuts(userId as string);
      res.json({ success: true, data: shortcuts, message: 'Keyboard shortcuts retrieved successfully' });
    } catch (error) {
      logger.error('Error getting keyboard shortcuts', { error });
      res.status(500).json({ success: false, message: 'Failed to get keyboard shortcuts' });
    }
  }

  async setKeyboardShortcuts(req: Request, res: Response): Promise<void> {
    try {
      const { userId, shortcuts } = req.body;
      await uxService.setKeyboardShortcuts(userId, shortcuts);
      res.json({ success: true, message: 'Keyboard shortcuts set successfully' });
    } catch (error) {
      logger.error('Error setting keyboard shortcuts', { error });
      res.status(500).json({ success: false, message: 'Failed to set keyboard shortcuts' });
    }
  }

  // Advanced Search
  async performAdvancedSearch(req: Request, res: Response): Promise<void> {
    try {
      const { query, filters, userId } = req.body;
      const results = await uxService.performAdvancedSearch(query, filters, userId);
      res.json({ success: true, data: results, message: 'Advanced search completed successfully' });
    } catch (error) {
      logger.error('Error performing advanced search', { error });
      res.status(500).json({ success: false, message: 'Failed to perform advanced search' });
    }
  }

  async getSearchSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { query, userId } = req.query;
      const suggestions = await uxService.getSearchSuggestions(query as string, userId as string);
      res.json({ success: true, data: suggestions, message: 'Search suggestions retrieved successfully' });
    } catch (error) {
      logger.error('Error getting search suggestions', { error });
      res.status(500).json({ success: false, message: 'Failed to get search suggestions' });
    }
  }

  // Bulk Operations
  async executeBulkOperation(req: Request, res: Response): Promise<void> {
    try {
      const { operation, items, userId } = req.body;
      const result = await uxService.executeBulkOperation(operation, items, userId);
      res.json({ success: true, data: result, message: 'Bulk operation executed successfully' });
    } catch (error) {
      logger.error('Error executing bulk operation', { error });
      res.status(500).json({ success: false, message: 'Failed to execute bulk operation' });
    }
  }

  async getBulkOperationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { operationId } = req.query;
      const status = await uxService.getBulkOperationStatus(operationId as string);
      res.json({ success: true, data: status, message: 'Bulk operation status retrieved successfully' });
    } catch (error) {
      logger.error('Error getting bulk operation status', { error });
      res.status(500).json({ success: false, message: 'Failed to get bulk operation status' });
    }
  }

  // Undo/Redo
  async undoAction(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      const result = await uxService.undoAction(userId);
      res.json({ success: true, data: result, message: 'Action undone successfully' });
    } catch (error) {
      logger.error('Error undoing action', { error });
      res.status(500).json({ success: false, message: 'Failed to undo action' });
    }
  }

  async redoAction(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      const result = await uxService.redoAction(userId);
      res.json({ success: true, data: result, message: 'Action redone successfully' });
    } catch (error) {
      logger.error('Error redoing action', { error });
      res.status(500).json({ success: false, message: 'Failed to redo action' });
    }
  }

  async getActionHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId, page = 1, limit = 10 } = req.query;
      const history = await uxService.getActionHistory(userId as string, parseInt(page as string), parseInt(limit as string));
      res.json({ success: true, data: history, message: 'Action history retrieved successfully' });
    } catch (error) {
      logger.error('Error getting action history', { error });
      res.status(500).json({ success: false, message: 'Failed to get action history' });
    }
  }
}

export const uxController = new UXController();