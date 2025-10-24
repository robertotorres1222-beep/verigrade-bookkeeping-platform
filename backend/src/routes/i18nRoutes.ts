import { Router } from 'express';
import { i18nController } from '../controllers/i18nController';

const router = Router();

// Multi-language Support
router.get('/languages', i18nController.getSupportedLanguages);
router.post('/languages', i18nController.addSupportedLanguage);
router.get('/translations', i18nController.getTranslations);
router.post('/translations', i18nController.updateTranslations);

// Currency/Date Formatting
router.get('/formatting', i18nController.getFormattingOptions);
router.post('/formatting', i18nController.setFormattingOptions);

// Translation Management
router.get('/translation-keys', i18nController.getTranslationKeys);
router.post('/translation-keys', i18nController.addTranslationKey);
router.put('/translation-keys/:id', i18nController.updateTranslationKey);

// RTL Support
router.get('/rtl-status', i18nController.getRTLStatus);
router.post('/rtl-support', i18nController.enableRTLSupport);

export default router;