export interface UsageStats {
  totalGenerations: number;
  summaryCount: number;
  questionsCount: number;
  planCount: number;
  avgOutputLength: number;
}

export const getDemoStats = (): UsageStats => ({
  totalGenerations: 127,
  summaryCount: 45,
  questionsCount: 52,
  planCount: 30,
  avgOutputLength: 847
});
