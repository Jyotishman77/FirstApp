export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  defaultLanguage: string;
}

export const COUNTRIES: Country[] = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', defaultLanguage: 'hi' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', defaultLanguage: 'en' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', defaultLanguage: 'en' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', defaultLanguage: 'ja' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', defaultLanguage: 'bn' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', defaultLanguage: 'en' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', defaultLanguage: 'en' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', defaultLanguage: 'de' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', defaultLanguage: 'fr' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', defaultLanguage: 'pt' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', defaultLanguage: 'en' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', defaultLanguage: 'ar' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', defaultLanguage: 'ko' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', defaultLanguage: 'en' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', defaultLanguage: 'zh' },
];

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];
