export const Colors = {
  light: {
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F4F4F6',
    bubbleUser: '#000000',
    textUser: '#FFFFFF',
    bubbleOther: '#E9E9EB',
    textOther: '#1C1C1E',
    accentActive: '#10B981',
    accentWarn: '#EF4444',
    divider: '#E5E5EA',
    textMuted: '#8E8E93',
    textPrimary: '#000000',
  },
  dark: {
    bgPrimary: '#0A0A0C',
    bgSecondary: '#141417',
    bubbleUser: '#FFFFFF',
    textUser: '#0A0A0C',
    bubbleOther: '#202024',
    textOther: '#E5E5EA',
    accentActive: '#34D399',
    accentWarn: '#F87171',
    divider: '#242427',
    textMuted: '#9898A0',
    textPrimary: '#FFFFFF',
  },
};

export type ThemeColors = typeof Colors.light;
