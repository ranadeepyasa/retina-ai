import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Download, ArrowLeft, Eye, ShieldCheck, AlertCircle,
  FileCheck, Clock, CheckCircle2, User, RefreshCw, Layers
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

import { screeningService, resolveImageUrl } from '../../services/api';
import { Screening } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { ConfidenceBar } from '../../components/ui/ConfidenceBar';
import { Alert } from '../../components/ui/Alert';

export const ResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [screening, setScreening] = useState<Screening | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'sideBySide' | 'toggle'>('sideBySide');
  const [activeToggleView, setActiveToggleView] = useState<'original' | 'gradcam'>('gradcam');

  useEffect(() => {
    const fetchScreening = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await screeningService.get(parseInt(id));
        setScreening(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Unable to load screening record.');
      } finally {
        setLoading(false);
      }
    };
    fetchScreening();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <RefreshCw className="w-8 h-8 text-[#2E6F73] animate-spin" />
        <p className="text-xs text-[#667477]">Loading screening result & Grad-CAM visualizer...</p>
      </div>
    );
  }

  if (error || !screening) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <Alert variant="danger" title="Error Loading Result">
          {error || 'Screening record not found.'}
        </Alert>
        <div className="mt-4">
          <Link to="/app">
            <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const pred = screening.prediction;
  const probs = pred?.probabilities || {};
  const probData = [
    { name: 'No DR', value: Math.round((probs['No DR'] || 0) * 100), color: '#4D8061' },
    { name: 'Mild', value: Math.round((probs['Mild'] || 0) * 100), color: '#2E6F73' },
    { name: 'Moderate', value: Math.round((probs['Moderate'] || 0) * 100), color: '#C98A3D' },
    { name: 'Severe', value: Math.round((probs['Severe'] || 0) * 100), color: '#B58A5A' },
    { name: 'Proliferative', value: Math.round((probs['Proliferative'] || 0) * 100), color: '#B94A48' },
  ];

  const dateFormatted = new Date(screening.created_at).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Breadcrumb & Download PDF */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app')}
            className="p-1.5 rounded-lg border border-[#DCE3E3] bg-white hover:bg-[#F7F8F6] text-[#667477] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2E6F73]">
                Screening Record #{screening.id}
              </span>
              {pred?.is_demo_model && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#C98A3D]/15 text-[#C98A3D] font-bold border border-[#C98A3D]/30">
                  Demo / Development Model
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#173B3F]">
              Patient: {screening.patient?.patient_code || `PT-${screening.patient_id}`}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={screeningService.getReportUrl(screening.id)}
            target="_blank"
            rel="noreferrer"
            download
          >
            <Button
              variant="primary"
              size="md"
              icon={<Download className="w-4 h-4" />}
            >
              Download PDF Report
            </Button>
          </a>
        </div>
      </div>

      {/* Patient & Screening Demographics Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE3E3] shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-[#667477] block text-[11px]">Patient Demographics</span>
          <span className="font-semibold text-[#173B3F]">
            {screening.patient?.age || '--'} yrs • {screening.patient?.sex || 'Unknown'}
          </span>
        </div>
        <div>
          <span className="text-[#667477] block text-[11px]">Diabetes Duration</span>
          <span className="font-semibold text-[#173B3F]">
            {screening.patient?.diabetes_duration || 'Not recorded'}
          </span>
        </div>
        <div>
          <span className="text-[#667477] block text-[11px]">Screening Timestamp</span>
          <span className="font-semibold text-[#173B3F]">{dateFormatted}</span>
        </div>
        <div>
          <span className="text-[#667477] block text-[11px]">Image Quality Pre-Check</span>
          <span className="font-semibold">
            <Badge variant={screening.image_quality === 'GOOD_QUALITY' ? 'success' : 'warning'} size="sm">
              {screening.image_quality === 'GOOD_QUALITY' ? 'Good Quality' : 'Poor Quality'}
            </Badge>
          </span>
        </div>
      </div>

      {/* PRIMARY RESULT BANNER */}
      <div className="bg-white p-6 rounded-2xl border border-[#DCE3E3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667477]">
            AI-Assisted Severity Classification
          </span>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#173B3F] tracking-tight">
              {pred ? pred.predicted_label.toUpperCase() : 'CLASSIFICATION PENDING'}
            </h2>
          </div>
          {pred && (
            <SeverityBadge severity={pred.predicted_class} size="lg" />
          )}
        </div>

        <div className="md:w-64 bg-[#F7F8F6] p-4 rounded-xl border border-[#DCE3E3] space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#667477] font-medium">Model Confidence</span>
            <span className="text-base font-bold text-[#173B3F]">
              {pred ? `${Math.round(pred.confidence * 100)}%` : '--'}
            </span>
          </div>
          <ConfidenceBar confidence={pred?.confidence || 0} showLabel={false} size="md" />
          <p className="text-[10px] text-[#667477]">
            Based on multi-class posterior probability distribution
          </p>
        </div>
      </div>

      {/* CORE DUAL VISUAL EVIDENCE: Original Fundus vs. Grad-CAM Overlay */}
      <div className="bg-white p-6 rounded-2xl border border-[#DCE3E3] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCE3E3] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#173B3F] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#2E6F73]" />
              Visual Evidence & Grad-CAM Explanation
            </h3>
            <p className="text-xs text-[#667477] mt-0.5">
              Gradient-weighted feature attribution localized to retinal vascular anatomy
            </p>
          </div>

          {/* View mode toggle */}
          <div className="flex bg-[#F7F8F6] p-1 rounded-xl border border-[#DCE3E3] text-xs font-medium">
            <button
              onClick={() => setViewMode('sideBySide')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'sideBySide' ? 'bg-white text-[#173B3F] shadow-xs' : 'text-[#667477]'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('toggle')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'toggle' ? 'bg-white text-[#173B3F] shadow-xs' : 'text-[#667477]'
              }`}
            >
              Interactive Switcher
            </button>
          </div>
        </div>

        {/* Dual Viewports */}
        {viewMode === 'sideBySide' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Fundus */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#173B3F]">Captured Fundus Photograph</span>
                <span className="text-[11px] text-[#667477]">Input Resolution: 224x224 RGB</span>
              </div>
              <div className="aspect-square bg-[#0A0A0E] rounded-xl overflow-hidden border border-[#DCE3E3] flex items-center justify-center">
                {screening.uploaded_image_url ? (
                  <img
                    src={resolveImageUrl(screening.uploaded_image_url)}
                    alt="Original Retinal Fundus"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-400">Fundus image not available</span>
                )}
              </div>
              <p className="text-[11px] text-[#667477] italic text-center">
                Figure 1: Optical fundus photography of the posterior pole
              </p>
            </div>

            {/* Grad-CAM Overlay */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#173B3F]">Grad-CAM Saliency Overlay</span>
                <span className="text-[11px] text-[#2E6F73] font-semibold">Final Convolutional Layer</span>
              </div>
              <div className="aspect-square bg-[#0A0A0E] rounded-xl overflow-hidden border border-[#DCE3E3] flex items-center justify-center">
                {pred?.gradcam_image_url ? (
                  <img
                    src={resolveImageUrl(pred.gradcam_image_url)}
                    alt="Grad-CAM Overlay"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-400">Grad-CAM overlay generating...</span>
                )}
              </div>
              <p className="text-[11px] text-[#667477] italic text-center">
                Figure 2: Heatmap attribution (Red/Yellow = Strongest model influence)
              </p>
            </div>
          </div>
        ) : (
          /* Interactive Switcher View */
          <div className="max-w-lg mx-auto space-y-3">
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setActiveToggleView('original')}
                className={`px-3 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                  activeToggleView === 'original'
                    ? 'bg-[#173B3F] text-white border-[#173B3F]'
                    : 'bg-white text-[#667477] border-[#DCE3E3]'
                }`}
              >
                Show Original Photograph
              </button>
              <button
                onClick={() => setActiveToggleView('gradcam')}
                className={`px-3 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                  activeToggleView === 'gradcam'
                    ? 'bg-[#173B3F] text-white border-[#173B3F]'
                    : 'bg-white text-[#667477] border-[#DCE3E3]'
                }`}
              >
                Show Grad-CAM Heatmap
              </button>
            </div>
            <div className="aspect-square bg-[#0A0A0E] rounded-xl overflow-hidden border border-[#DCE3E3] flex items-center justify-center">
              <img
                src={
                  activeToggleView === 'gradcam'
                    ? resolveImageUrl(pred?.gradcam_image_url || screening.uploaded_image_url)
                    : resolveImageUrl(screening.uploaded_image_url)
                }
                alt="Retinal View"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Grad-CAM Explanation Callout */}
        <div className="p-4 rounded-xl bg-[#F7F8F6] border border-[#DCE3E3] space-y-2">
          <h4 className="text-xs font-bold text-[#173B3F] uppercase tracking-wider">
            Why did the model make this prediction?
          </h4>
          <p className="text-xs text-[#667477] leading-relaxed">
            The highlighted regions represent areas that contributed more strongly to the model's prediction. 
            This visualization is intended to improve transparency and does not independently establish a clinical diagnosis.
          </p>
        </div>
      </div>

      {/* PROBABILITY DISTRIBUTION & CLINICAL INTERPRETATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Horizontal Probability Distribution Chart */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#DCE3E3] shadow-xs space-y-4">
          <div className="border-b border-[#DCE3E3] pb-3">
            <h3 className="text-sm font-bold text-[#173B3F]">Class Probability Distribution</h3>
            <p className="text-[11px] text-[#667477]">Model softmax outputs across all 5 clinical stages</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={probData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 10, fill: '#667477' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#173B3F', fontWeight: 600 }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Probability']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DCE3E3', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {probData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === pred?.predicted_label.replace(' Diabetic Retinopathy', '').replace(' Diabetic Retinopathy', '') ? '#173B3F' : '#DCEDEC'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 text-[11px] text-[#667477] flex items-center justify-between border-t border-[#DCE3E3]">
            <span>Primary Predicted: <strong>{pred?.predicted_label}</strong></span>
            <span>Architecture: {pred?.model_version || 'EfficientNet-B0'}</span>
          </div>
        </div>

        {/* Clinical Interpretation & Referral Action */}
        <div className="lg:col-span-6 space-y-6">
          <Card title="Screening Interpretation" subtitle="Key microvascular pattern observations">
            <p className="text-xs text-[#172326] leading-relaxed">
              {pred?.interpretation || 'Awaiting detailed clinical interpretation notes.'}
            </p>
          </Card>

          <Card title="Suggested Next Step" subtitle="Decision support for referral planning">
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#DCEDEC]/50 border border-[#2E6F73]/30 text-xs font-medium text-[#173B3F]">
                {pred?.suggested_action || 'Consider referral for professional ophthalmological evaluation.'}
              </div>
              <div className="flex items-center justify-between text-xs text-[#667477] pt-1">
                <span>Referral Urgency Category:</span>
                <span className="font-bold text-[#173B3F]">{screening.referral_urgency}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* MANDATORY CLINICAL SAFETY DISCLAIMER */}
      <Alert variant="warning" title="Clinical Safety & Governance Notice">
        RetinaAI is an AI-assisted screening decision support system. The severity grading and Grad-CAM saliency overlays 
        represent algorithmic assistance and do not constitute an autonomous medical diagnosis. Clinical confirmation by 
        a qualified ophthalmologist or licensed eye-care professional is mandatory before initiating medical or surgical interventions.
      </Alert>
    </div>
  );
};
