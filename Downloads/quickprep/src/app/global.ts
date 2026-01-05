// Track usage for demo stats
export const trackEvent = (event: string, data?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    // Google Analytics / Plausible / Custom
    console.log('🎯', event, data);
  }
};
