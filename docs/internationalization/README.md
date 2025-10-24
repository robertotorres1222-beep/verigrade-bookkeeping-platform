# VeriGrade Internationalization (i18n)

This document provides comprehensive information about the internationalization features in the VeriGrade bookkeeping platform, including multi-language support, RTL (Right-to-Left) languages, currency formatting, and localization.

## Table of Contents

1. [Overview](#overview)
2. [Supported Languages](#supported-languages)
3. [Frontend Implementation](#frontend-implementation)
4. [Backend Implementation](#backend-implementation)
5. [RTL Support](#rtl-support)
6. [Currency & Number Formatting](#currency--number-formatting)
7. [Date & Time Formatting](#date--time-formatting)
8. [User Preferences](#user-preferences)
9. [API Reference](#api-reference)
10. [Best Practices](#best-practices)

## Overview

The VeriGrade platform supports comprehensive internationalization with:

- **Multi-language Support**: 6 languages with full translation coverage
- **RTL Support**: Arabic and Hebrew with proper right-to-left layout
- **Currency Formatting**: Automatic currency formatting based on locale
- **Date/Time Formatting**: Locale-specific date and time formats
- **Number Formatting**: Proper number formatting with locale-specific separators
- **User Preferences**: Per-user language and formatting preferences
- **Dynamic Language Switching**: Real-time language switching without page reload

## Supported Languages

### LTR Languages
- **English (en)** - Default language
- **Spanish (es)** - Español
- **French (fr)** - Français  
- **German (de)** - Deutsch

### RTL Languages
- **Arabic (ar)** - العربية
- **Hebrew (he)** - עברית

### Language Features
- **Native Names**: Each language displays its native name
- **Flag Icons**: Visual flag indicators for each language
- **Direction Support**: Automatic LTR/RTL direction switching
- **Complete Translation**: All UI elements translated
- **Pluralization**: Proper plural forms for each language
- **Number Formatting**: Locale-specific number formats

## Frontend Implementation

### i18n Configuration

```typescript
// frontend/src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });
```

### Language Switcher Component

```typescript
// frontend/src/components/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  
  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    
    // Update document direction for RTL languages
    const language = languages.find(lang => lang.code === languageCode);
    if (language?.rtl) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };
  
  return (
    <Select value={i18n.language} onChange={handleLanguageChange}>
      {languages.map(language => (
        <MenuItem key={language.code} value={language.code}>
          <Box display="flex" alignItems="center" gap={1}>
            <span>{language.flag}</span>
            <span>{language.nativeName}</span>
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
};
```

### Translation Usage

```typescript
// Using translations in components
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.welcome', { name: 'John' })}</p>
      <button>{t('common.save')}</button>
    </div>
  );
};
```

### RTL Support

```css
/* frontend/src/styles/rtl.css */
[dir="rtl"] {
  text-align: right;
}

[dir="rtl"] .MuiTypography-root {
  text-align: right;
}

[dir="rtl"] .MuiDrawer-paper {
  right: 0;
  left: auto;
}

[dir="rtl"] .MuiButton-startIcon {
  margin-left: 8px;
  margin-right: -4px;
}
```

## Backend Implementation

### i18n Service

```typescript
// backend/src/services/i18nService.ts
class I18nService {
  public async getLocales(): Promise<Locale[]> {
    const locales = await this.prisma.locale.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    return locales;
  }

  public formatCurrency(
    amount: number,
    currency: string = 'USD',
    locale: string = 'en-US'
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  public formatDate(
    date: Date,
    locale: string = 'en-US',
    options?: Intl.DateTimeFormatOptions
  ): string {
    return new Intl.DateTimeFormat(locale, options).format(date);
  }
}
```

### Database Schema

```sql
-- Locales table
CREATE TABLE locales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100) NOT NULL,
    direction VARCHAR(3) NOT NULL CHECK (direction IN ('ltr', 'rtl')),
    currency VARCHAR(3) NOT NULL,
    date_format VARCHAR(20) NOT NULL,
    number_format VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Translations table
CREATE TABLE translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) NOT NULL,
    locale VARCHAR(10) NOT NULL,
    namespace VARCHAR(100) NOT NULL DEFAULT 'translation',
    value TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(key, locale, namespace)
);

-- User preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    date_format VARCHAR(20) NOT NULL DEFAULT 'MM/DD/YYYY',
    number_format VARCHAR(20) NOT NULL DEFAULT 'en-US',
    direction VARCHAR(3) NOT NULL DEFAULT 'ltr'
);
```

## RTL Support

### RTL Language Features

**Arabic (ar)**
- **Direction**: Right-to-left (RTL)
- **Currency**: Saudi Riyal (SAR)
- **Date Format**: DD/MM/YYYY
- **Number Format**: ar-SA
- **Text Alignment**: Right-aligned
- **Icon Direction**: Mirrored

**Hebrew (he)**
- **Direction**: Right-to-left (RTL)
- **Currency**: Israeli Shekel (ILS)
- **Date Format**: DD/MM/YYYY
- **Number Format**: he-IL
- **Text Alignment**: Right-aligned
- **Icon Direction**: Mirrored

### RTL CSS Implementation

```css
/* RTL-specific styles */
[dir="rtl"] {
  text-align: right;
}

[dir="rtl"] .MuiDrawer-paper {
  right: 0;
  left: auto;
}

[dir="rtl"] .MuiButton-startIcon {
  margin-left: 8px;
  margin-right: -4px;
}

[dir="rtl"] .MuiIconButton-root {
  transform: scaleX(-1);
}
```

### RTL Component Adjustments

```typescript
// RTL-aware component
const RTLComponent = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'he';
  
  return (
    <Box sx={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        sx={{
          transform: isRTL ? 'scaleX(-1)' : 'none'
        }}
      >
        {t('common.back')}
      </Button>
    </Box>
  );
};
```

## Currency & Number Formatting

### Currency Formatting

```typescript
// Format currency based on locale
const formatCurrency = (amount: number, currency: string, locale: string) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Examples:
formatCurrency(1000, 'USD', 'en-US'); // "$1,000.00"
formatCurrency(1000, 'EUR', 'fr-FR'); // "1 000,00 €"
formatCurrency(1000, 'SAR', 'ar-SA'); // "١٬٠٠٠٫٠٠ ر.س"
```

### Number Formatting

```typescript
// Format numbers based on locale
const formatNumber = (number: number, locale: string) => {
  return new Intl.NumberFormat(locale).format(number);
};

// Examples:
formatNumber(1234.56, 'en-US'); // "1,234.56"
formatNumber(1234.56, 'fr-FR'); // "1 234,56"
formatNumber(1234.56, 'ar-SA'); // "١٬٢٣٤٫٥٦"
```

## Date & Time Formatting

### Date Formatting

```typescript
// Format dates based on locale
const formatDate = (date: Date, locale: string) => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Examples:
formatDate(new Date(), 'en-US'); // "January 15, 2024"
formatDate(new Date(), 'fr-FR'); // "15 janvier 2024"
formatDate(new Date(), 'ar-SA'); // "١٥ يناير ٢٠٢٤"
```

### Time Formatting

```typescript
// Format time based on locale
const formatTime = (date: Date, locale: string) => {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
};

// Examples:
formatTime(new Date(), 'en-US'); // "2:30:45 PM"
formatTime(new Date(), 'fr-FR'); // "14:30:45"
formatTime(new Date(), 'ar-SA'); // "٢:٣٠:٤٥ م"
```

### Relative Time

```typescript
// Get relative time (e.g., "2 hours ago")
const getRelativeTime = (date: Date, locale: string) => {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const now = new Date();
  const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
  return rtf.format(diffInHours, 'hour');
};

// Examples:
getRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000), 'en-US'); // "2 hours ago"
getRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000), 'fr-FR'); // "il y a 2 heures"
getRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000), 'ar-SA'); // "منذ ساعتين"
```

## User Preferences

### User Preference Management

```typescript
// Get user preferences
const getUserPreferences = async (userId: string) => {
  const preferences = await I18nService.getUserPreferences(userId);
  return preferences;
};

// Update user preferences
const updateUserPreferences = async (userId: string, preferences: UserPreferences) => {
  const updated = await I18nService.updateUserPreferences(userId, preferences);
  return updated;
};
```

### Preference Structure

```typescript
interface UserPreferences {
  userId: string;
  language: string;        // 'en', 'es', 'fr', 'de', 'ar', 'he'
  timezone: string;        // 'UTC', 'America/New_York', etc.
  currency: string;        // 'USD', 'EUR', 'GBP', etc.
  dateFormat: string;      // 'MM/DD/YYYY', 'DD/MM/YYYY', etc.
  numberFormat: string;    // 'en-US', 'fr-FR', 'ar-SA', etc.
  direction: 'ltr' | 'rtl';
}
```

## API Reference

### Get Supported Locales

```http
GET /api/i18n/locales
```

**Response:**
```json
{
  "success": true,
  "locales": [
    {
      "code": "en",
      "name": "English",
      "nativeName": "English",
      "direction": "ltr",
      "currency": "USD",
      "dateFormat": "MM/DD/YYYY",
      "numberFormat": "en-US",
      "isActive": true
    }
  ]
}
```

### Get Translations

```http
GET /api/i18n/translations/{locale}
GET /api/i18n/translations/{locale}/{namespace}
```

**Response:**
```json
{
  "success": true,
  "locale": "en",
  "namespace": "translation",
  "translations": {
    "common.save": "Save",
    "common.cancel": "Cancel",
    "dashboard.title": "Dashboard"
  }
}
```

### Format Currency

```http
POST /api/i18n/format/currency
```

**Request:**
```json
{
  "amount": 1000,
  "currency": "USD",
  "locale": "en-US"
}
```

**Response:**
```json
{
  "success": true,
  "formatted": "$1,000.00",
  "amount": 1000,
  "currency": "USD",
  "locale": "en-US"
}
```

### Format Date

```http
POST /api/i18n/format/date
```

**Request:**
```json
{
  "date": "2024-01-15T10:30:00Z",
  "locale": "en-US",
  "options": {
    "year": "numeric",
    "month": "long",
    "day": "numeric"
  }
}
```

**Response:**
```json
{
  "success": true,
  "formatted": "January 15, 2024",
  "date": "2024-01-15T10:30:00.000Z",
  "locale": "en-US"
}
```

### Get User Preferences

```http
GET /api/i18n/preferences
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "preferences": {
    "userId": "user-123",
    "language": "en",
    "timezone": "America/New_York",
    "currency": "USD",
    "dateFormat": "MM/DD/YYYY",
    "numberFormat": "en-US",
    "direction": "ltr"
  }
}
```

### Update User Preferences

```http
PUT /api/i18n/preferences
Authorization: Bearer {token}
```

**Request:**
```json
{
  "language": "es",
  "timezone": "Europe/Madrid",
  "currency": "EUR",
  "dateFormat": "DD/MM/YYYY",
  "numberFormat": "es-ES",
  "direction": "ltr"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User preferences updated successfully",
  "preferences": {
    "userId": "user-123",
    "language": "es",
    "timezone": "Europe/Madrid",
    "currency": "EUR",
    "dateFormat": "DD/MM/YYYY",
    "numberFormat": "es-ES",
    "direction": "ltr"
  }
}
```

## Best Practices

### Translation Keys

1. **Use descriptive keys**: `dashboard.welcome` instead of `welcome`
2. **Namespace organization**: Group related translations
3. **Consistent naming**: Use consistent naming conventions
4. **Avoid hardcoded strings**: Always use translation keys

### RTL Considerations

1. **Test RTL layouts**: Always test with Arabic and Hebrew
2. **Icon direction**: Mirror icons for RTL languages
3. **Text alignment**: Ensure proper text alignment
4. **Navigation**: Consider RTL navigation patterns

### Performance

1. **Lazy loading**: Load translations on demand
2. **Caching**: Cache translations in browser
3. **Bundle splitting**: Split translations by language
4. **CDN**: Use CDN for translation files

### Accessibility

1. **Screen readers**: Ensure proper language attributes
2. **Keyboard navigation**: Test with RTL keyboard layouts
3. **Color contrast**: Maintain contrast in all languages
4. **Font support**: Ensure font support for all languages

### Testing

1. **Language switching**: Test all language combinations
2. **RTL layout**: Test RTL layouts thoroughly
3. **Formatting**: Test currency, date, and number formatting
4. **User preferences**: Test preference persistence

---

This comprehensive internationalization system ensures that VeriGrade can serve users worldwide with proper localization, formatting, and user experience for all supported languages and regions.







