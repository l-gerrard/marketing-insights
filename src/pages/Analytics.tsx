
import Header from '@/components/Header';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

const AnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-vivid-sky-blue-50 via-white to-maya-blue-50">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <AnalyticsDashboard />
      </div>
    </div>
  );
};

export default AnalyticsPage;
