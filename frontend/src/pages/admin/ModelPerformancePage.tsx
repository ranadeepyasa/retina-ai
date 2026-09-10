import React, { useState, useEffect } from 'react';
import {
  Cpu, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw, UploadCloud, Info, FileSpreadsheet
} from 'lucide-react';
import { adminService } from '../../services/api';
import { ModelPerformanceMetrics } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';

export const ModelPerformancePage: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await adminService.getModelPerformance();
      setMetrics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const metricCards = [
    { label: 'Overall Accuracy', value: metrics?.accuracy ? `${(metrics.accuracy * 100).toFixed(1)}%` : 'Not evaluated' },
    { label: 'Sensitivity (Recall)', value: metrics?.sensitivity ? `${(metrics.sensitivity * 100).toFixed(1)}%` : 'Not evaluated' },
    { label: 'Specificity', value: metrics?.specificity ? `${(metrics.specificity * 100).toFixed(1)}%` : 'Not evaluated' },
    { label: 'Macro F1-Score', value: metrics?.f1_score ? `${(metrics.f1_score * 100).toFixed(1)}%` : 'Not evaluated' },
    { label: 'Weighted Precision', value: metrics?.precision ? `${(metrics.precision * 100).toFixed(1)}%` : 'Not evaluated' },
  ];

  const classLabels = ['0 - No DR', '1 - Mild', '2 - Moderate', '3 - Severe', '4 - Proliferative'];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#173B3F]">Model Performance & Governance</h1>
            <Badge variant={metrics?.is_evaluated ? 'success' : 'warning'} size="sm">
              {metrics?.is_evaluated ? 'Evaluated on Test Set' : 'Development Prototype'}
            </Badge>
          </div>
          <p className="text-xs text-[#667477] mt-0.5">
            Architecture: {metrics?.architecture || 'EfficientNet-B0 + Grad-CAM'} • Version: {metrics?.version || 'v1.0-dev'}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchMetrics}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh Metrics
        </Button>
      </div>

      {/* Mandatory Honesty Notice Banner */}
      {!metrics?.is_evaluated ? (
        <Alert variant="warning" title="Model Evaluation Status: Not Evaluated">
          {metrics?.status_message ||
            'Model evaluation metrics will appear after evaluation on the held-out test set. No synthetic or fabricated clinical metrics are presented.'}
        </Alert>
      ) : (
        <Alert variant="success" title="Evaluation Verified">
          Official evaluation metrics loaded dynamically from held-out test set evaluation (<code>models/metrics.json</code>).
        </Alert>
      )}

      {/* 5 Clinical Metric Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map((m) => (
          <div key={m.label} className="bg-white p-5 rounded-2xl border border-[#DCE3E3] shadow-xs space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667477]">{m.label}</span>
            <div className="text-2xl font-bold text-[#173B3F]">
              {m.value === 'Not evaluated' ? (
                <span className="text-sm font-semibold text-[#667477] italic bg-[#F7F8F6] px-2.5 py-1 rounded-md border border-[#DCE3E3]">
                  Not evaluated
                </span>
              ) : (
                m.value
              )}
            </div>
            <p className="text-[10px] text-[#667477]">
              {m.value === 'Not evaluated' ? 'Requires held-out test split' : 'Multi-class test score'}
            </p>
          </div>
        ))}
      </div>

      {/* Confusion Matrix Section */}
      <Card
        title="Confusion Matrix"
        subtitle={metrics?.is_evaluated ? "5x5 Class prediction matrix on held-out test cohort" : "Held-out test split evaluation required"}
      >
        {metrics?.is_evaluated && metrics.confusion_matrix ? (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="text-center text-xs w-full max-w-lg mx-auto border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-[#667477]">Actual \ Predicted</th>
                    {classLabels.map((c) => (
                      <th key={c} className="p-2 font-bold text-[#173B3F]">{c.split(' - ')[1]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.confusion_matrix.map((row, rIdx) => (
                    <tr key={rIdx} className="border-t border-[#DCE3E3]">
                      <td className="p-2 text-left font-bold text-[#173B3F]">{classLabels[rIdx]}</td>
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className={`p-2 font-mono font-semibold ${
                            rIdx === cIdx ? 'bg-[#DCEDEC] text-[#173B3F]' : 'text-[#667477]'
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Per-Class Metrics Breakdown */}
            {metrics.per_class_metrics && (
              <div className="border-t border-[#DCE3E3] pt-4">
                <h4 className="text-xs font-bold text-[#173B3F] mb-2 uppercase tracking-wider">
                  Per-Class Sensitivity, Precision & F1 Breakdown
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#DCE3E3] text-[#667477]">
                        <th className="py-2">DR Grade</th>
                        <th className="py-2">Sensitivity (Recall)</th>
                        <th className="py-2">Precision</th>
                        <th className="py-2">F1-Score</th>
                        <th className="py-2">Test Support</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(metrics.per_class_metrics).map(([clsName, vals]: [string, any]) => (
                        <tr key={clsName} className="border-b border-[#DCE3E3]/60 hover:bg-[#F7F8F6]">
                          <td className="py-2 font-semibold text-[#173B3F]">{clsName}</td>
                          <td className="py-2 font-mono">{(vals.recall * 100).toFixed(1)}%</td>
                          <td className="py-2 font-mono">{(vals.precision * 100).toFixed(1)}%</td>
                          <td className="py-2 font-mono">{(vals.f1_score * 100).toFixed(1)}%</td>
                          <td className="py-2 text-[#667477]">{vals.support ?? '--'} samples</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 rounded-xl border border-dashed border-[#DCE3E3] bg-[#F7F8F6] text-center space-y-2">
            <FileSpreadsheet className="w-8 h-8 text-[#667477] mx-auto" />
            <h4 className="text-xs font-bold text-[#173B3F]">Confusion Matrix Not Yet Evaluated</h4>
            <p className="text-xs text-[#667477] max-w-md mx-auto">
              Execute <code>python ml/evaluate.py</code> with a labeled test set in <code>dataset/test/</code> to generate the empirical confusion matrix and populate this chart.
            </p>
          </div>
        )}
      </Card>

      {/* Model Checkpoint & ROC Curve Upload UI Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Model Checkpoint Management" subtitle="Production PyTorch weight loading">
          <div className="space-y-3 text-xs text-[#667477]">
            <p>
              The active model loads from <code>backend/models/dr_model.pth</code>. When present, the server automatically switches from Demo Mode to production inference.
            </p>
            <div className="p-4 rounded-xl border border-dashed border-[#DCE3E3] bg-[#F7F8F6] text-center">
              <UploadCloud className="w-6 h-6 text-[#2E6F73] mx-auto mb-1.5" />
              <span className="font-semibold text-[#173B3F] block">Upload Trained Weights (.pth)</span>
              <span className="text-[11px] text-[#667477]">EfficientNet-B0 5-class state_dict</span>
            </div>
          </div>
        </Card>

        <Card title="Receiver Operating Characteristic (ROC)" subtitle="Multi-class Area Under Curve (AUC)">
          <div className="space-y-3 text-xs text-[#667477]">
            <p>
              ROC curves and per-class AUC plots will be rendered upon completion of validation testing against clinical benchmark sets.
            </p>
            <div className="p-4 rounded-xl border border-dashed border-[#DCE3E3] bg-[#F7F8F6] text-center">
              <ShieldCheck className="w-6 h-6 text-[#2E6F73] mx-auto mb-1.5" />
              <span className="font-semibold text-[#173B3F] block">ROC / Precision-Recall Curve</span>
              <span className="text-[11px] text-[#667477]">Awaiting held-out test evaluation</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
