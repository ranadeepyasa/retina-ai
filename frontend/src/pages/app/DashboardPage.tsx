import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle, Activity, Clock, AlertTriangle, CheckCircle2,
  FileText, ArrowRight, Eye, RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { dashboardService, screeningService } from '../../services/api';
import { DashboardStats, Screening } from '../../types';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, recentScreenings] = await Promise.all([
        dashboardService.getStats(),
        screeningService.list({ limit: 8 } as any),
      ]);
      setStats(statsData);
      setScreenings(recentScreenings);
    } catch (e) {
      console.error('Failed to fetch dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header & Main Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#173B3F]">
            {t('dashboard.welcome', 'Clinical Screening Dashboard')}
          </h1>
          <p className="text-xs text-[#667477] mt-0.5">
            {t('dashboard.subtitle', 'Overview of community retinal screenings and pending referrals')} • {user?.facility || 'Primary Health Centre'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            {t('common.retry', 'Refresh')}
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/app/new-screening')}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            {t('dashboard.startNewScreening', '+ New Screening')}
          </Button>
        </div>
      </div>

      {/* Top 4 Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('dashboard.totalScreenings', "Total Screenings")}
          value={stats?.todays_screenings ?? '--'}
          subtext="Screened at this facility"
          icon={<Activity className="w-5 h-5" />}
        />
        <StatCard
          label={t('dashboard.pendingReviews', "Pending Review")}
          value={stats?.pending_review ?? '--'}
          subtext="Awaiting clinician triage"
          icon={<Clock className="w-5 h-5 text-[#C98A3D]" />}
        />
        <StatCard
          label={t('dashboard.urgentReferrals', "Referrals Suggested")}
          value={stats?.referrals_suggested ?? '--'}
          subtext="Stage 1 to 4 flagged"
          icon={<AlertTriangle className="w-5 h-5 text-[#B94A48]" />}
        />
        <StatCard
          label={t('dashboard.totalScreenings', "Total Screenings")}
          value={stats?.total_screenings ?? '--'}
          subtext={`Avg Conf: ${stats ? Math.round(stats.avg_confidence * 100) : 88}%`}
          icon={<FileText className="w-5 h-5" />}
        />
      </div>

      {/* Recent Screenings Table */}
      <div className="bg-white rounded-2xl border border-[#DCE3E3] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#DCE3E3] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#173B3F]">{t('dashboard.recentScreenings', 'Recent Retinal Screenings')}</h2>
            <p className="text-xs text-[#667477]">Latest patient scans processed by the AI screening pipeline</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/history')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            {t('dashboard.viewAll', 'View All History')}
          </Button>
        </div>

        {screenings.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Eye className="w-6 h-6" />}
              title="No screenings yet"
              description="Start your first retinal screening to see results and Grad-CAM explanations here."
              action={
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate('/app/new-screening')}
                  icon={<PlusCircle className="w-3.5 h-3.5" />}
                >
                  {t('dashboard.startNewScreening', 'Start First Screening')}
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8F6] text-[#667477] border-b border-[#DCE3E3] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3">{t('screening.patientId', 'Patient ID')}</th>
                  <th className="px-6 py-3">{t('common.date', 'Date')}</th>
                  <th className="px-6 py-3">{t('screening.qualityCheckTitle', 'Image Quality')}</th>
                  <th className="px-6 py-3">{t('results.title', 'AI Result')}</th>
                  <th className="px-6 py-3">{t('results.confidenceTitle', 'Confidence')}</th>
                  <th className="px-6 py-3">{t('common.status', 'Review Status')}</th>
                  <th className="px-6 py-3 text-right">{t('common.actions', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE3E3] text-[#172326]">
                {screenings.map((s) => {
                  const pred = s.prediction;
                  const dateStr = new Date(s.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-[#F7F8F6]/60 transition-colors cursor-pointer"
                      onClick={() => navigate(`/app/result/${s.id}`)}
                    >
                      <td className="px-6 py-3.5 font-bold text-[#173B3F]">
                        {s.patient?.patient_code || `PT-${s.patient_id}`}
                      </td>
                      <td className="px-6 py-3.5 text-[#667477]">
                        {dateStr}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge
                          variant={s.image_quality === 'GOOD_QUALITY' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {s.image_quality === 'GOOD_QUALITY' ? 'Good Quality' : 'Poor Quality'}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5">
                        {pred ? (
                          <SeverityBadge severity={pred.predicted_class} size="sm" />
                        ) : (
                          <span className="text-[#667477]">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-[#173B3F]">
                        {pred ? `${Math.round(pred.confidence * 100)}%` : '--'}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge
                          variant={
                            s.status === 'REVIEWED'
                              ? 'success'
                              : s.status === 'REFERRED'
                              ? 'danger'
                              : 'default'
                          }
                          size="sm"
                        >
                          {s.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/app/result/${s.id}`);
                          }}
                          className="text-xs font-semibold text-[#2E6F73] hover:text-[#173B3F] hover:underline"
                        >
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
