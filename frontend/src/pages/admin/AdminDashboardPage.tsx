import React, { useState, useEffect } from 'react';
import {
  Users, Activity, AlertTriangle, ShieldCheck, Cpu, RefreshCw, BarChart2, CheckCircle2
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

import { adminService } from '../../services/api';
import { AdminAnalytics } from '../../types';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const AdminDashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAnalytics();
      setAnalytics(data);
    } catch (e) {
      console.error('Failed to fetch admin analytics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const sev = analytics?.severity_distribution;
  const severityData = [
    { name: 'No DR', count: sev?.no_dr || 0, fill: '#4D8061' },
    { name: 'Mild', count: sev?.mild || 0, fill: '#2E6F73' },
    { name: 'Moderate', count: sev?.moderate || 0, fill: '#C98A3D' },
    { name: 'Severe', count: sev?.severe || 0, fill: '#B58A5A' },
    { name: 'Proliferative', count: sev?.proliferative || 0, fill: '#B94A48' },
  ];

  const qualityData = [
    { name: 'Good Quality', value: analytics?.quality_stats.good_quality || 0, color: '#2E6F73' },
    { name: 'Poor Quality', value: analytics?.quality_stats.poor_quality || 0, color: '#B94A48' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#173B3F]">Administrative Overview</h1>
          <p className="text-xs text-[#667477] mt-0.5">
            District tele-ophthalmology screening metrics & AI system health
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAnalytics}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh Data
        </Button>
      </div>

      {/* 5 Top Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Users"
          value={analytics?.total_users ?? '--'}
          subtext="Healthcare Workers & Admins"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Total Screenings"
          value={analytics?.total_screenings ?? '--'}
          subtext="Cumulative scans logged"
          icon={<Activity className="w-5 h-5" />}
        />
        <StatCard
          label="Screenings Today"
          value={analytics?.screenings_today ?? '--'}
          subtext="Real-time daily volume"
          icon={<Activity className="w-5 h-5 text-[#2E6F73]" />}
        />
        <StatCard
          label="Referrals Suggested"
          value={analytics?.referrals_suggested ?? '--'}
          subtext="Stage 1+ triaged cases"
          icon={<AlertTriangle className="w-5 h-5 text-[#B94A48]" />}
        />
        <StatCard
          label="Avg AI Confidence"
          value={analytics ? `${Math.round(analytics.avg_confidence * 100)}%` : '--'}
          subtext="Posterior calibration"
          icon={<ShieldCheck className="w-5 h-5 text-[#4D8061]" />}
        />
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Screenings Timeline */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#DCE3E3] shadow-xs space-y-4">
          <div className="border-b border-[#DCE3E3] pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#173B3F]">Screenings & Referrals Trend (Last 7 Days)</h3>
              <p className="text-[11px] text-[#667477]">Daily patient volume vs. specialist referral recommendations</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.screenings_timeline || []}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#667477' }} />
                <YAxis tick={{ fontSize: 11, fill: '#667477' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DCE3E3', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="screenings" name="Total Screenings" stroke="#173B3F" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="referrals" name="Referrals Flagged" stroke="#B94A48" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Image Quality Pie Gauge */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#DCE3E3] shadow-xs space-y-4">
          <div className="border-b border-[#DCE3E3] pb-3">
            <h3 className="text-sm font-bold text-[#173B3F]">Image Quality Compliance</h3>
            <p className="text-[11px] text-[#667477]">Focus & illumination pass rate</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={qualityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {qualityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val} scans`, 'Volume']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center pt-1 border-t border-[#DCE3E3]">
            <span className="text-2xl font-black text-[#173B3F]">
              {analytics?.quality_stats.good_rate_percent || 100}%
            </span>
            <span className="text-[11px] text-[#667477] block">Acceptable Quality Pass Rate</span>
          </div>
        </div>

        {/* Severity Distribution Bar Chart */}
        <div className="lg:col-span-12 bg-white p-6 rounded-2xl border border-[#DCE3E3] shadow-xs space-y-4">
          <div className="border-b border-[#DCE3E3] pb-3">
            <h3 className="text-sm font-bold text-[#173B3F]">Cumulative Severity Breakdown</h3>
            <p className="text-[11px] text-[#667477]">Patient counts across 5 International Clinical Diabetic Retinopathy stages</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#173B3F', fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 11, fill: '#667477' }} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} Patients`, 'Count']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DCE3E3', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-sev-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
