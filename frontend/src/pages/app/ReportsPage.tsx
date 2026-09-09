import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, ExternalLink, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { screeningService } from '../../services/api';
import { Screening } from '../../types';
import { Button } from '../../components/ui/Button';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await screeningService.list();
      setScreenings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#173B3F]">Clinical Screening Reports</h1>
          <p className="text-xs text-[#667477] mt-0.5">
            Standardized tele-ophthalmology referral documentation with Grad-CAM evidence
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchReports}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      </div>

      {/* Overview Banner on Standardized PDF Report */}
      <div className="bg-white p-6 rounded-2xl border border-[#DCE3E3] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <h2 className="text-sm font-bold text-[#173B3F]">Standardized Referral Documentation</h2>
          <p className="text-xs text-[#667477] leading-relaxed">
            Each generated report includes patient vitals, 5-stage ICDR classification, original fundus photography, 
            gradient-weighted saliency heatmap, probability breakdown, referral urgency recommendation, and clinician sign-off block.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#2E6F73] font-semibold shrink-0">
          <CheckCircle2 className="w-4 h-4" />
          <span>ReportLab PDF Engine Active</span>
        </div>
      </div>

      {/* Reports Archive Table */}
      <div className="bg-white rounded-2xl border border-[#DCE3E3] shadow-xs overflow-hidden">
        {screenings.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<FileText className="w-6 h-6" />}
              title="No screening reports have been generated"
              description="Conduct a new screening to generate and download signed clinical referral reports."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8F6] text-[#667477] border-b border-[#DCE3E3] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3">Report ID</th>
                  <th className="px-6 py-3">Patient Code</th>
                  <th className="px-6 py-3">Date Generated</th>
                  <th className="px-6 py-3">Severity Grade</th>
                  <th className="px-6 py-3">Referral Urgency</th>
                  <th className="px-6 py-3 text-right">Actions</th>
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
                    <tr key={s.id} className="hover:bg-[#F7F8F6]/60 transition-colors">
                      <td className="px-6 py-3.5 font-mono text-[#667477]">
                        SCR-{s.id.toString().padStart(5, '0')}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-[#173B3F]">
                        {s.patient?.patient_code || `PT-${s.patient_id}`}
                      </td>
                      <td className="px-6 py-3.5 text-[#667477]">{dateStr}</td>
                      <td className="px-6 py-3.5">
                        {pred ? (
                          <SeverityBadge severity={pred.predicted_class} size="sm" />
                        ) : (
                          <span className="text-[#667477]">Unclassified</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge
                          variant={
                            s.referral_urgency === 'URGENT'
                              ? 'danger'
                              : s.referral_urgency === 'SEMI_URGENT'
                              ? 'warning'
                              : 'default'
                          }
                          size="sm"
                        >
                          {s.referral_urgency}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/app/result/${s.id}`)}
                            className="p-1.5 rounded-lg border border-[#DCE3E3] hover:bg-[#F7F8F6] text-[#173B3F] transition-colors cursor-pointer"
                            title="View Interactive Result"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={screeningService.getReportUrl(s.id)}
                            target="_blank"
                            rel="noreferrer"
                            download
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#173B3F] hover:bg-[#122e31] text-white font-medium text-[11px] transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            <span>PDF</span>
                          </a>
                        </div>
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
