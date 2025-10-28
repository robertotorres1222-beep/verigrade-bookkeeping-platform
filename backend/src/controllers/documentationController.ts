import { Request, Response } from 'express';
import { documentationService } from '../services/documentationService';
import logger from '../utils/logger';

export class DocumentationController {
  // Swagger API Docs
  async getSwaggerDocs(req: Request, res: Response): Promise<void> {
    try {
      const docs = await documentationService.getSwaggerDocs();
      res.json({ success: true, data: docs, message: 'Swagger docs retrieved successfully' });
    } catch (error) {
      logger.error('Error getting Swagger docs', { error });
      res.status(500).json({ success: false, message: 'Failed to get Swagger docs' });
    }
  }

  async updateSwaggerDocs(req: Request, res: Response): Promise<void> {
    try {
      await documentationService.updateSwaggerDocs(req.body);
      res.json({ success: true, message: 'Swagger docs updated successfully' });
    } catch (error) {
      logger.error('Error updating Swagger docs', { error });
      res.status(500).json({ success: false, message: 'Failed to update Swagger docs' });
    }
  }

  // User Guides
  async getUserGuides(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, category } = req.query;
      const guides = await documentationService.getUserGuides({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        category: category as string,
      });
      res.json({ success: true, data: guides, message: 'User guides retrieved successfully' });
    } catch (error) {
      logger.error('Error retrieving user guides', { error });
      res.status(500).json({ success: false, message: 'Failed to retrieve user guides' });
    }
  }

  async getUserGuide(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const guide = await documentationService.getUserGuide(id);
      res.json({ success: true, data: guide, message: 'User guide retrieved successfully' });
    } catch (error) {
      logger.error('Error retrieving user guide', { error });
      res.status(500).json({ success: false, message: 'Failed to retrieve user guide' });
    }
  }

  async createUserGuide(req: Request, res: Response): Promise<void> {
    try {
      const guide = await documentationService.createUserGuide(req.body);
      res.status(201).json({ success: true, data: guide, message: 'User guide created successfully' });
    } catch (error) {
      logger.error('Error creating user guide', { error });
      res.status(500).json({ success: false, message: 'Failed to create user guide' });
    }
  }

  // Video Tutorials
  async getVideoTutorials(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, category } = req.query;
      const tutorials = await documentationService.getVideoTutorials({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        category: category as string,
      });
      res.json({ success: true, data: tutorials, message: 'Video tutorials retrieved successfully' });
    } catch (error) {
      logger.error('Error retrieving video tutorials', { error });
      res.status(500).json({ success: false, message: 'Failed to retrieve video tutorials' });
    }
  }

  async getVideoTutorial(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tutorial = await documentationService.getVideoTutorial(id);
      res.json({ success: true, data: tutorial, message: 'Video tutorial retrieved successfully' });
    } catch (error) {
      logger.error('Error retrieving video tutorial', { error });
      res.status(500).json({ success: false, message: 'Failed to retrieve video tutorial' });
    }
  }

  async createVideoTutorial(req: Request, res: Response): Promise<void> {
    try {
      const tutorial = await documentationService.createVideoTutorial(req.body);
      res.status(201).json({ success: true, data: tutorial, message: 'Video tutorial created successfully' });
    } catch (error) {
      logger.error('Error creating video tutorial', { error });
      res.status(500).json({ success: false, message: 'Failed to create video tutorial' });
    }
  }

  // Architecture Diagrams
  async getArchitectureDiagrams(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, type } = req.query;
      const diagrams = await documentationService.getArchitectureDiagrams({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        type: type as string,
      });
      res.json({ success: true, data: diagrams, message: 'Architecture diagrams retrieved successfully' });
    } catch (error) {
      logger.error('Error retrieving architecture diagrams', { error });
      res.status(500).json({ success: false, message: 'Failed to retrieve architecture diagrams' });
    }
  }

  async getArchitectureDiagram(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const diagram = await documentationService.getArchitectureDiagram(id);
      res.json({ success: true, data: diagram, message: 'Architecture diagram retrieved successfully' });
    } catch (error) {
      logger.error('Error retrieving architecture diagram', { error });
      res.status(500).json({ success: false, message: 'Failed to retrieve architecture diagram' });
    }
  }

  async createArchitectureDiagram(req: Request, res: Response): Promise<void> {
    try {
      const diagram = await documentationService.createArchitectureDiagram(req.body);
      res.status(201).json({ success: true, data: diagram, message: 'Architecture diagram created successfully' });
    } catch (error) {
      logger.error('Error creating architecture diagram', { error });
      res.status(500).json({ success: false, message: 'Failed to create architecture diagram' });
    }
  }

  // Runbooks
  async getRunbooks(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, category } = req.query;
      const runbooks = await documentationService.getRunbooks({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        category: category as string,
      });
      res.json({ success: true, data: runbooks, message: 'Runbooks retrieved successfully' });
    } catch (error) {
      logger.error('Error retrieving runbooks', { error });
      res.status(500).json({ success: false, message: 'Failed to retrieve runbooks' });
    }
  }

  async getRunbook(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const runbook = await documentationService.getRunbook(id);
      res.json({ success: true, data: runbook, message: 'Runbook retrieved successfully' });
    } catch (error) {
      logger.error('Error retrieving runbook', { error });
      res.status(500).json({ success: false, message: 'Failed to retrieve runbook' });
    }
  }

  async createRunbook(req: Request, res: Response): Promise<void> {
    try {
      const runbook = await documentationService.createRunbook(req.body);
      res.status(201).json({ success: true, data: runbook, message: 'Runbook created successfully' });
    } catch (error) {
      logger.error('Error creating runbook', { error });
      res.status(500).json({ success: false, message: 'Failed to create runbook' });
    }
  }
}

export const documentationController = new DocumentationController();







