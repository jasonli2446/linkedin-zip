// UI Colors for LinkedIn Zip game

export const COLORS = {
  // Background colors
  background: '#F5F5F7',
  gridBackground: '#FFFFFF',
  cellBackground: '#F8F9FA',
  cellBorder: '#E5E7EB',

  // Path colors (gradient-like purple/blue)
  pathColor: '#6366F1', // Indigo - main path color
  pathColorLight: '#818CF8',
  pathColorDark: '#4F46E5',

  // Checkpoint colors
  checkpoint: '#1F2937', // Dark gray/black circles
  checkpointBorder: '#374151',
  checkpointText: '#FFFFFF',

  // Next checkpoint highlight
  nextCheckpoint: '#10B981', // Green highlight for next target
  nextCheckpointBorder: '#059669',

  // Text colors
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#FFFFFF',

  // UI elements
  success: '#10B981',
  buttonPrimary: '#6366F1',
  buttonSecondary: '#E5E7EB',
  buttonText: '#FFFFFF',

  // Header/navigation
  headerBackground: '#FFFFFF',
  progressBar: '#6366F1',
  progressBarBackground: '#E5E7EB',
};

// Legacy exports for compatibility
export const PATH_COLORS = [
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#F43F5E',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#14B8A6',
  '#06B6D4',
  '#3B82F6',
  '#A855F7',
  '#D946EF',
];

export const getPathColor = (pathId: number): string => {
  return PATH_COLORS[(pathId - 1) % PATH_COLORS.length];
};
