// Add to page.tsx: <UsageStats />
import { getDemoStats } from '../../lib/analytics';

const UsageStats = () => {
  const stats = getDemoStats();
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-number">{stats.totalGenerations}</div>
        <div>Total Generations</div>
      </div>
      {/* ... more stats */}
    </div>
  );
};
