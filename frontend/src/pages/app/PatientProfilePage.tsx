import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, PlusCircle, Search, Calendar, Activity, ArrowRight, Eye } from 'lucide-react';
import { patientService } from '../../services/api';
import { Patient } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';

export const PatientProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientDetail, setPatientDetail] = useState<(Patient & { timeline: any[] }) | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await patientService.list(search.trim());
      setPatients(data);
      if (data.length > 0 && !selectedPatientId) {
        loadDetail(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (pId: number) => {
    setSelectedPatientId(pId);
    try {
      const detail = await patientService.get(pId);
      setPatientDetail(detail);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#173B3F]">Patient Profiles</h1>
          <p className="text-xs text-[#667477] mt-0.5">
            Longitudinal diabetic retinopathy screening history and progression records
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/app/new-screening')}
          icon={<PlusCircle className="w-4 h-4" />}
        >
          + New Patient Screening
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Patient Selection Column */}
        <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-[#DCE3E3] shadow-xs space-y-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#667477] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              onKeyDown={(e) => e.key === 'Enter' && fetchPatients()}
              placeholder="Search patients..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#DCE3E3] focus:outline-none focus:ring-2 focus:ring-[#2E6F73] bg-[#F7F8F6]/40"
            />
          </div>

          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {patients.length === 0 ? (
              <p className="text-xs text-[#667477] text-center py-6">No patient records found.</p>
            ) : (
              patients.map((p) => (
                <div
                  key={p.id}
                  onClick={() => loadDetail(p.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedPatientId === p.id
                      ? 'bg-[#DCEDEC]/50 border-[#2E6F73]'
                      : 'bg-white border-[#DCE3E3] hover:bg-[#F7F8F6]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#173B3F]">{p.patient_code}</span>
                    <span className="text-[10px] text-[#667477] px-1.5 py-0.5 rounded bg-[#F7F8F6] border border-[#DCE3E3]">
                      {p.screenings_count || 0} scan{p.screenings_count === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#667477] mt-1">
                    {p.age} yrs • {p.sex} • {p.diabetes_duration || 'Duration unknown'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Patient Profile & Longitudinal Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {patientDetail ? (
            <>
              {/* Header Demographics Card */}
              <div className="bg-white p-6 rounded-2xl border border-[#DCE3E3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#173B3F]">{patientDetail.patient_code}</span>
                    <Badge variant="teal" size="sm">Active Patient</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-[#667477] mt-2">
                    <span><strong>Age:</strong> {patientDetail.age}</span>
                    <span><strong>Sex:</strong> {patientDetail.sex}</span>
                    <span><strong>Diabetes Duration:</strong> {patientDetail.diabetes_duration || 'N/A'}</span>
                  </div>
                  {patientDetail.notes && (
                    <p className="text-xs text-[#667477] mt-2 italic bg-[#F7F8F6] p-2 rounded-lg border border-[#DCE3E3]">
                      "{patientDetail.notes}"
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/app/new-screening')}
                    icon={<PlusCircle className="w-3.5 h-3.5" />}
                  >
                    New Screening
                  </Button>
                </div>
              </div>

              {/* Screening Timeline */}
              <div className="bg-white p-6 rounded-2xl border border-[#DCE3E3] shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#173B3F]">Screening History Timeline</h3>

                {patientDetail.timeline && patientDetail.timeline.length === 0 ? (
                  <EmptyState
                    icon={<Eye className="w-5 h-5" />}
                    title="No screenings recorded"
                    description="This patient has not yet undergone AI retinal analysis."
                  />
                ) : (
                  <div className="space-y-3">
                    {patientDetail.timeline.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => navigate(`/app/result/${item.id}`)}
                        className="p-4 rounded-xl border border-[#DCE3E3] hover:border-[#2E6F73] bg-[#F7F8F6]/40 hover:bg-[#F7F8F6] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#173B3F]">
                              Screening #{item.id}
                            </span>
                            <span className="text-[11px] text-[#667477]">
                              {new Date(item.created_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          {item.prediction && (
                            <div className="flex items-center gap-2 pt-0.5">
                              <SeverityBadge severity={item.prediction.predicted_class} size="sm" />
                              <span className="text-xs font-bold text-[#173B3F]">
                                {Math.round(item.prediction.confidence * 100)}% Conf.
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              item.status === 'REVIEWED'
                                ? 'success'
                                : item.status === 'REFERRED'
                                ? 'danger'
                                : 'default'
                            }
                            size="sm"
                          >
                            {item.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs font-semibold text-[#2E6F73]">
                            View Saliency Map →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-[#DCE3E3] text-center">
              <p className="text-xs text-[#667477]">Select a patient from the list to view their screening timeline.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
