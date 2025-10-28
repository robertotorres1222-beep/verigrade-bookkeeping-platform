import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Language as LanguageIcon,
  Check as CheckIcon,
  Translate as TranslateIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷'
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪'
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true
  },
  {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    flag: '🇮🇱',
    rtl: true
  }
];

interface LanguageSwitcherProps {
  variant?: 'select' | 'menu' | 'chips';
  size?: 'small' | 'medium' | 'large';
  showFlags?: boolean;
  showNativeNames?: boolean;
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'select',
  size = 'medium',
  showFlags = true,
  showNativeNames = true,
  className
}) => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setAnchorEl(null);
    
    // Update document direction for RTL languages
    const language = languages.find(lang => lang.code === languageCode);
    if (language?.rtl) {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = languageCode;
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = languageCode;
    }
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  if (variant === 'select') {
    return (
      <FormControl size={size} className={className}>
        <InputLabel id="language-select-label">
          <Box display="flex" alignItems="center" gap={1}>
            <LanguageIcon fontSize="small" />
            {t('settings.language')}
          </Box>
        </InputLabel>
        <Select
          labelId="language-select-label"
          value={i18n.language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          label={t('settings.language')}
        >
          {languages.map((language) => (
            <MenuItem key={language.code} value={language.code}>
              <ListItemIcon>
                <Box display="flex" alignItems="center" gap={1}>
                  {showFlags && <span>{language.flag}</span>}
                  <LanguageIcon fontSize="small" />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={showNativeNames ? language.nativeName : language.name}
                secondary={showNativeNames ? language.name : undefined}
              />
              {i18n.language === language.code && (
                <CheckIcon fontSize="small" color="primary" />
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  if (variant === 'menu') {
    return (
      <Box className={className}>
        <Tooltip title={t('settings.language')}>
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            size={size}
            color="inherit"
          >
            <LanguageIcon />
          </IconButton>
        </Tooltip>
        
        {/* This would be implemented with a proper Menu component */}
        <Box
          sx={{
            position: 'absolute',
            top: '100%',
            right: 0,
            bgcolor: 'background.paper',
            boxShadow: 2,
            borderRadius: 1,
            minWidth: 200,
            zIndex: 1000,
            display: anchorEl ? 'block' : 'none'
          }}
        >
          {languages.map((language) => (
            <Box
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.5,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover'
                },
                bgcolor: i18n.language === language.code ? 'primary.light' : 'transparent'
              }}
            >
              {showFlags && <span>{language.flag}</span>}
              <Box>
                <Typography variant="body2" fontWeight={i18n.language === language.code ? 'bold' : 'normal'}>
                  {showNativeNames ? language.nativeName : language.name}
                </Typography>
                {showNativeNames && (
                  <Typography variant="caption" color="textSecondary">
                    {language.name}
                  </Typography>
                )}
              </Box>
              {i18n.language === language.code && (
                <CheckIcon fontSize="small" color="primary" />
              )}
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  if (variant === 'chips') {
    return (
      <Box display="flex" gap={1} flexWrap="wrap" className={className}>
        {languages.map((language) => (
          <Chip
            key={language.code}
            label={
              <Box display="flex" alignItems="center" gap={0.5}>
                {showFlags && <span>{language.flag}</span>}
                <Typography variant="caption">
                  {showNativeNames ? language.nativeName : language.name}
                </Typography>
              </Box>
            }
            onClick={() => handleLanguageChange(language.code)}
            color={i18n.language === language.code ? 'primary' : 'default'}
            variant={i18n.language === language.code ? 'filled' : 'outlined'}
            size={size}
            icon={<TranslateIcon />}
          />
        ))}
      </Box>
    );
  }

  return null;
};

export default LanguageSwitcher;










