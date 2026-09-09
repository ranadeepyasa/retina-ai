import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Activity, CheckCircle2, RefreshCw } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { adminService } from '../../services/api';
import { AdminAnalytics } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAnalytics();
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#173B3F]">Screening Analytics</h1>
          <p className="text-xs text-[#667477] mt-0.5">
            Regional epidemiology, severity stratification, and referral throughput
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAnalytics}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-[#DCE3E3] shadow-xs space-y-2">
          <span className="text-xs font-semibold text-[#667477] uppercase tracking-wider">Referral Rate</span>
          <p className="text-3xl font-extrabold text-[#173B3F]">
            {analytics && analytics.total_screenings > 0
              ? `${Math.round((analytics.referrals_suggested / analytics.total_screenings) * 100)}%`
              : '0%'}
          </p>
          <p className="text-xs text-[#667477]">Cases recommended for routine to urgent specialist referral</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#DCE3E3] shadow-xs space-y-2">
          <span className="text-xs font-semibold text-[#667477] uppercase tracking-wider">Image Quality Adequacy</span>
          <p className="text-3xl font-extrabold text-[#2E6F73]">
            {analytics?.quality_stats.good_rate_percent || 100}%
          </p>
          <p className="text-xs text-[#667477]">Scans with sufficient focus and illumination for AI screening</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#DCE3E3] shadow-xs space-y-2">
          <span className="text-xs font-semibold text-[#667477] uppercase tracking-wider">Screening Throughput</span>
          <p className="text-3xl font-extrabold text-[#4D8061]">
            {analytics?.screenings_today || 0}
          </p>
          <p className="text-xs text-[#667477]">Patients screened during today's clinical operations</p>
        </div>
      </div>

      {/* 7-Day Timeline Chart */}
      <Card title="Screening Volume Over Time" subtitle="Daily counts of processed fundus scans">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics?.screenings_timeline || []}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#667477' }} />
              <YAxis tick={{ fontSize: 11, fill: '#667477' }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DCE3E3', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="screenings" name="Screenings Completed" stroke="#173B3F" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
