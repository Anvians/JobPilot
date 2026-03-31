const darkColors = {
  bg: '#0f0f13',
  bg2: '#17171d',
  bg3: '#1e1e27',
  bg4: '#25252f',
  border: '#2e2e3a',
  border2: '#3a3a48',
  text: '#e8e8f0',
  text2: '#9898b0',
  text3: '#5a5a70',
  accent: '#6c63ff',
  accent2: '#8b84ff',
  accentBg: '#1a1830',
  green: '#22c98a',
  greenBg: '#0d2b1f',
  amber: '#f0a030',
  amberBg: '#2b1f0a',
  red: '#e05555',
  redBg: '#2b1010',
  blue: '#4a9eff',
  blueBg: '#0a1e35',
  purple: '#b06cff',
  purpleBg: '#1e0a35',
  teal: '#20d0c0',
  tealBg: '#0a2825',
};

const lightColors = {
  bg: '#f5f7fb',
  bg2: '#ffffff',
  bg3: '#eef2f8',
  bg4: '#e4e9f2',
  border: '#d8deea',
  border2: '#c3cddd',
  text: '#182033',
  text2: '#566074',
  text3: '#7d8799',
  accent: '#5b57f5',
  accent2: '#7a76ff',
  accentBg: '#ecebff',
  green: '#149a67',
  greenBg: '#e8f8f1',
  amber: '#d98616',
  amberBg: '#fff4e1',
  red: '#d34a4a',
  redBg: '#fdeaea',
  blue: '#2f7df4',
  blueBg: '#e9f2ff',
  purple: '#8c52ff',
  purpleBg: '#f1eaff',
  teal: '#0ea5a3',
  tealBg: '#e6fbfa',
};

const darkStageColors = {
  Applied: { bg: '#0a1e35', text: '#4a9eff' },
  Screening: { bg: '#2b1f0a', text: '#f0a030' },
  Interview: { bg: '#1e0a35', text: '#b06cff' },
  'HR Round': { bg: '#0a2825', text: '#20d0c0' },
  Offer: { bg: '#0d2b1f', text: '#22c98a' },
  Rejected: { bg: '#2b1010', text: '#e05555' },
  Ghosted: { bg: '#25252f', text: '#5a5a70' },
};

const lightStageColors = {
  Applied: { bg: '#e9f2ff', text: '#2f7df4' },
  Screening: { bg: '#fff4e1', text: '#d98616' },
  Interview: { bg: '#f1eaff', text: '#8c52ff' },
  'HR Round': { bg: '#e6fbfa', text: '#0ea5a3' },
  Offer: { bg: '#e8f8f1', text: '#149a67' },
  Rejected: { bg: '#fdeaea', text: '#d34a4a' },
  Ghosted: { bg: '#edf1f7', text: '#7d8799' },
};

export const colors = { ...darkColors };

export const STAGES = ['Applied', 'Screening', 'Interview', 'HR Round', 'Offer', 'Rejected', 'Ghosted'];

export const STAGE_COLORS = { ...darkStageColors };

export const STAGE_BAR_COLORS = {
  Applied: '#4a9eff',
  Screening: '#f0a030',
  Interview: '#b06cff',
  'HR Round': '#20d0c0',
  Offer: '#22c98a',
  Rejected: '#e05555',
  Ghosted: '#8d96a8',
};

export function applyTheme(mode = 'dark') {
  const nextColors = mode === 'light' ? lightColors : darkColors;
  const nextStageColors = mode === 'light' ? lightStageColors : darkStageColors;

  Object.assign(colors, nextColors);

  Object.keys(STAGE_COLORS).forEach((key) => {
    STAGE_COLORS[key] = nextStageColors[key];
  });
}

export function isLightMode(mode) {
  return mode === 'light';
}

applyTheme('dark');
