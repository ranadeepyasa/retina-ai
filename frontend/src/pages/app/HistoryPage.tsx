import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, RefreshCw, Eye, ArrowRight } from 'lucide-react';
import { screeningService } from '../../services/api';
import { Screening } from '../../types';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();

  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchScreenings = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (severityFilter !== 'all') params.severity = parseInt(severityFilter);
      if (statusFilter !== 'all') params.status = statusFilter;

      const data = await screeningService.list(params);
      setScreenings(data);
    } catch (e) {
      console.error('Failed to fetch screenings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreenings();
  }, [severityFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchScreenings();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#173B3F]">Screening History</h1>
          <p className="text-xs text-[#667477] mt-0.5">
            Archival records of all patient screenings and Grad-CAM evaluations
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchScreenings}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE3E3] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#667477] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Patient ID (e.g. DEMO-001)..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#DCE3E3] focus:outline-none focus:ring-2 focus:ring-[#2E6F73] bg-[#F7F8F6]/40"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#667477]">
            <Filter className="w-3.5 h-3.5" />
            <span>Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-[#DCE3E3] bg-[#F7F8F6] text-[#172326] focus:outline-none focus:ring-2 focus:ring-[#2E6F73]"
            >
              <option value="all">All Stages</option>
              <option value="0">Stage 0: No DR</option>
              <option value="1">Stage 1: Mild NPDR</option>
              <option value="2">Stage 2: Moderate NPDR</option>
              <option value="3">Stage 3: Severe NPDR</option>
              <option value="4">Stage 4: Proliferative DR</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#667477]">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-[#DCE3E3] bg-[#F7F8F6] text-[#172326] focus:outline-none focus:ring-2 focus:ring-[#2E6F73]"
            >
              <option value="all">All Statuses</option>
              <option value="ANALYZED">Analyzed</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="REFERRED">Referred</option>
            </select>
          </div>
        </div>
      </div>

      {/* Screenings Table */}
      <div className="bg-white rounded-2xl border border-[#DCE3E3] shadow-xs overflow-hidden">
        {screenings.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Eye className="w-6 h-6" />}
              title="No matching screenings found"
              description="Try adjusting your search criteria or clear active filters."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8F6] text-[#667477] border-b border-[#DCE3E3] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3">Screening ID</th>
                  <th className="px-6 py-3">Patient ID</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">AI Result</th>
                  <th className="px-6 py-3">Confidence</th>
                  <th className="px-6 py-3">Reviewer / Creator</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
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
                      <td className="px-6 py-3.5 font-mono text-[#667477]">
                        SCR-{s.id.toString().padStart(4, '0')}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-[#173B3F]">
                        {s.patient?.patient_code || `PT-${s.patient_id}`}
                      </td>
                      <td className="px-6 py-3.5 text-[#667477]">{dateStr}</td>
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
                      <td className="px-6 py-3.5 text-[#667477]">
                        {s.created_by_name || 'Healthcare Worker'}
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
                          View Result →
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
