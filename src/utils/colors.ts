// Path color palette - distinct colors for each path

export const PATH_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Sky Blue
  '#96CEB4', // Sage Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
  '#BB8FCE', // Lavender
  '#85C1E9', // Light Blue
  '#F8B500', // Orange
  '#82E0AA', // Light Green
];

export const getPathColor = (pathId: number): string => {
  return PATH_COLORS[(pathId - 1) % PATH_COLORS.length];
};

// UI Colors
export const COLORS = {
  background: '#1a1a2e',
  gridBackground: '#16213e',
  cellBackground: '#1a1a2e',
  cellBorder: '#2a2a4e',
  cellHighlight: '#3a3a5e',
  text: '#ffffff',
  textSecondary: '#9ca3af',
  success: '#4ade80',
  buttonPrimary: '#4f46e5',
  buttonSecondary: '#374151',
};
