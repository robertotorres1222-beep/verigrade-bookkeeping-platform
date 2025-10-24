import { Request, Response } from 'express';
import { i18nService } from '../services/i18nService';
import logger from '../utils/logger';

export class I18nController {
  // Multi-language Support
  async getSupportedLanguages(req: Request, res: Response): Promise<void> {
    try {
      const languages = await i18nService.getSupportedLanguages();
      res.json({ success: true, data: languages, message: 'Supported languages retrieved successfully' });
    } catch (error) {
      logger.error('Error getting supported languages', { error });
      res.status(500).json({ success: false, message: 'Failed to get supported languages' });
    }
  }

  async addSupportedLanguage(req: Request, res: Response): Promise<void> {
    try {
      const language = await i18nService.addSupportedLanguage(req.body);
      res.status(201).json({ success: true, data: language, message: 'Language added successfully' });
    } catch (error) {
      logger.error('Error adding supported language', { error });
      res.status(500).json({ success: false, message: 'Failed to add supported language' });
    }
  }

  async getTranslations(req: Request, res: Response): Promise<void> {
    try {
      const { language, namespace } = req.query;
      const translations = await i18nService.getTranslations(language as string, namespace as string);
      res.json({ success: true, data: translations, message: 'Translations retrieved successfully' });
    } catch (error) {
      logger.error('Error getting translations', { error });
      res.status(500).json({ success: false, message: 'Failed to get translations' });
    }
  }

  async updateTranslations(req: Request, res: Response): Promise<void> {
    try {
      const { language, namespace, translations } = req.body;
      await i18nService.updateTranslations(language, namespace, translations);
      res.json({ success: true, message: 'Translations updated successfully' });
    } catch (error) {
      logger.error('Error updating translations', { error });
      res.status(500).json({ success: false, message: 'Failed to update translations' });
    }
  }

  // Currency/Date Formatting
  async getFormattingOptions(req: Request, res: Response): Promise<void> {
    try {
      const { language } = req.query;
      const options = await i18nService.getFormattingOptions(language as string);
      res.json({ success: true, data: options, message: 'Formatting options retrieved successfully' });
    } catch (error) {
      logger.error('Error getting formatting options', { error });
      res.status(500).json({ success: false, message: 'Failed to get formatting options' });
    }
  }

  async setFormattingOptions(req: Request, res: Response): Promise<void> {
    try {
      const { language, options } = req.body;
      await i18nService.setFormattingOptions(language, options);
      res.json({ success: true, message: 'Formatting options set successfully' });
    } catch (error) {
      logger.error('Error setting formatting options', { error });
      res.status(500).json({ success: false, message: 'Failed to set formatting options' });
    }
  }

  // Translation Management
  async getTranslationKeys(req: Request, res: Response): Promise<void> {
    try {
      const { namespace } = req.query;
      const keys = await i18nService.getTranslationKeys(namespace as string);
      res.json({ success: true, data: keys, message: 'Translation keys retrieved successfully' });
    } catch (error) {
      logger.error('Error getting translation keys', { error });
      res.status(500).json({ success: false, message: 'Failed to get translation keys' });
    }
  }

  async addTranslationKey(req: Request, res: Response): Promise<void> {
    try {
      const key = await i18nService.addTranslationKey(req.body);
      res.status(201).json({ success: true, data: key, message: 'Translation key added successfully' });
    } catch (error) {
      logger.error('Error adding translation key', { error });
      res.status(500).json({ success: false, message: 'Failed to add translation key' });
    }
  }

  async updateTranslationKey(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const key = await i18nService.updateTranslationKey(id, req.body);
      res.json({ success: true, data: key, message: 'Translation key updated successfully' });
    } catch (error) {
      logger.error('Error updating translation key', { error });
      res.status(500).json({ success: false, message: 'Failed to update translation key' });
    }
  }

  // RTL Support
  async getRTLStatus(req: Request, res: Response): Promise<void> {
    try {
      const { language } = req.query;
      const status = await i18nService.getRTLStatus(language as string);
      res.json({ success: true, data: status, message: 'RTL status retrieved successfully' });
    } catch (error) {
      logger.error('Error getting RTL status', { error });
      res.status(500).json({ success: false, message: 'Failed to get RTL status' });
    }
  }

  async enableRTLSupport(req: Request, res: Response): Promise<void> {
    try {
      const { language, enabled } = req.body;
      await i18nService.enableRTLSupport(language, enabled);
      res.json({ success: true, message: 'RTL support updated successfully' });
    } catch (error) {
      logger.error('Error enabling RTL support', { error });
      res.status(500).json({ success: false, message: 'Failed to enable RTL support' });
    }
  }
}

export const i18nController = new I18nController();