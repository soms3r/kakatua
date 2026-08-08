// Country flag color themes for Culture Cards (app/components/countryThemes.ts)

export interface CountryTheme {
  name: string;
  flagEmoji: string;
  accent: string;
  accentDark: string;
  accentSoft: string;
  accentBg: string;
  border: string;
  stripes: string[];
}

export const DEFAULT_THEME: CountryTheme = {
  name: 'Flock',
  flagEmoji: '',
  accent: '#2d5a27',
  accentDark: '#154212',
  accentSoft: '#bcf0ae',
  accentBg: '#e8f5e3',
  border: '#a1d494',
  stripes: ['#2d5a27', '#a1d494', '#2d5a27'],
};

export const COUNTRY_THEMES: Record<string, CountryTheme> = {
  bangladesh: {
    name: 'Bangladesh',
    flagEmoji: '🇧🇩',
    accent: '#006a4e',
    accentDark: '#00493a',
    accentSoft: '#a7e0c9',
    accentBg: '#e4f5ec',
    border: '#8fd4b4',
    stripes: ['#006a4e', '#f42a41'],
  },
  japan: {
    name: 'Japan',
    flagEmoji: '🇯🇵',
    accent: '#bc002d',
    accentDark: '#8f0022',
    accentSoft: '#ffd5de',
    accentBg: '#fff0f3',
    border: '#f7b0bd',
    stripes: ['#bc002d', '#ffffff', '#bc002d'],
  },
  india: {
    name: 'India',
    flagEmoji: '🇮🇳',
    accent: '#138808',
    accentDark: '#0b5c05',
    accentSoft: '#bfe8bc',
    accentBg: '#ecf8ec',
    border: '#9fd99b',
    stripes: ['#ff9933', '#ffffff', '#138808'],
  },
  thailand: {
    name: 'Thailand',
    flagEmoji: '🇹🇭',
    accent: '#a51931',
    accentDark: '#7d1425',
    accentSoft: '#ffd3da',
    accentBg: '#fff1f3',
    border: '#f2a9b4',
    stripes: ['#a51931', '#f4f5f8', '#2d2a4a', '#f4f5f8', '#a51931'],
  },
  'south-korea': {
    name: 'South Korea',
    flagEmoji: '🇰🇷',
    accent: '#0047a0',
    accentDark: '#003372',
    accentSoft: '#bcd7f5',
    accentBg: '#edf4fd',
    border: '#9ec0e8',
    stripes: ['#ffffff', '#cd2e3a', '#0047a0'],
  },
  brazil: {
    name: 'Brazil',
    flagEmoji: '🇧🇷',
    accent: '#009c3b',
    accentDark: '#006d2a',
    accentSoft: '#bce8cf',
    accentBg: '#ecf9f0',
    border: '#9ddcb8',
    stripes: ['#009c3b', '#ffdf00', '#002776'],
  },
  germany: {
    name: 'Germany',
    flagEmoji: '🇩🇪',
    accent: '#dd0000',
    accentDark: '#a80000',
    accentSoft: '#ffd6d6',
    accentBg: '#fff1f1',
    border: '#f0b3b3',
    stripes: ['#000000', '#dd0000', '#ffce00'],
  },
  usa: {
    name: 'United States',
    flagEmoji: '🇺🇸',
    accent: '#3c3b6e',
    accentDark: '#2b2a51',
    accentSoft: '#c7c6e8',
    accentBg: '#efeff8',
    border: '#a5a4d4',
    stripes: ['#b22234', '#ffffff', '#3c3b6e'],
  },
  uk: {
    name: 'United Kingdom',
    flagEmoji: '🇬🇧',
    accent: '#012169',
    accentDark: '#00174e',
    accentSoft: '#c4d1ec',
    accentBg: '#eef2fa',
    border: '#9db2da',
    stripes: ['#012169', '#ffffff', '#c8102e'],
  },
  australia: {
    name: 'Australia',
    flagEmoji: '🇦🇺',
    accent: '#00247d',
    accentDark: '#001a59',
    accentSoft: '#c3cfea',
    accentBg: '#eef2fa',
    border: '#9aabce',
    stripes: ['#00247d', '#ff0000', '#ffffff'],
  },
  pakistan: {
    name: 'Pakistan',
    flagEmoji: '🇵🇰',
    accent: '#01411c',
    accentDark: '#012f14',
    accentSoft: '#b7dcc6',
    accentBg: '#ecf5ef',
    border: '#8fc2a2',
    stripes: ['#01411c', '#ffffff'],
  },
};

export function getCountryTheme(slug?: string | null): CountryTheme {
  return (slug && COUNTRY_THEMES[slug]) || DEFAULT_THEME;
}
