import React, { useState } from 'react';
import { Settings, Trash2, Database, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

export const SettingsPage: React.FC = () => {
  const [clearing, setClearing] = useState(false);
  const [clearMsg, setClearMsg] = useState<string | null>(null);

  const handleClearDemoData = async () => {
    if (!window.confirm('Are you sure you want to clear demo patient records (DEMO-001, DEMO-002, DEMO-003)? User accounts will remain intact.')) {
      return;
    }

    setClearing(true);
    setClearMsg(null);
    try {
      const res = await adminService.clearDemoData();
      setClearMsg(res.message);
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Failed to clear demo data.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-[#173B3F]">System Settings & Maintenance</h1>
        <p className="text-xs text-[#667477] mt-0.5">
          Configuration parameters, data retention, and demonstration environment controls
        </p>
      </div>

      {clearMsg && (
        <Alert variant="success" title="Demo Cleanup Completed">
          {clearMsg}
        </Alert>
      )}

      {/* Demo Data Management */}
      <Card
        title="Demonstration Data Controls"
        subtitle="Manage pre-seeded SIH evaluation patient records"
      >
        <div className="space-y-4 text-xs text-[#667477]">
          <p>
            The platform initializes with a small, clearly marked demo dataset (<code>DEMO-001</code>, <code>DEMO-002</code>, <code>DEMO-003</code>) to allow immediate evaluation of the Grad-CAM visualization without manually uploading dozens of test images.
          </p>
          <div className="p-4 rounded-xl border border-[#DCE3E3] bg-[#F7F8F6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-bold text-[#173B3F] block">Clear Pre-Seeded Demo Records</span>
              <span className="text-[11px] text-[#667477]">Removes all DEMO-* patients and their associated screenings</span>
            </div>
            <Button
              variant="danger"
              size="sm"
              isLoading={clearing}
              onClick={handleClearDemoData}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Clear Demo Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Storage & Environment Specs */}
      <Card title="Environment & Storage Paths" subtitle="Local directory bindings">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-[#F7F8F6] rounded-xl border border-[#DCE3E3]">
            <span className="text-[11px] font-semibold text-[#667477] uppercase block">Fundus Uploads Path</span>
            <span className="font-mono text-[#173B3F] font-bold">backend/uploads/</span>
          </div>
          <div className="p-3 bg-[#F7F8F6] rounded-xl border border-[#DCE3E3]">
            <span className="text-[11px] font-semibold text-[#667477] uppercase block">Model Weights Directory</span>
            <span className="font-mono text-[#173B3F] font-bold">backend/models/dr_model.pth</span>
          </div>
          <div className="p-3 bg-[#F7F8F6] rounded-xl border border-[#DCE3E3]">
            <span className="text-[11px] font-semibold text-[#667477] uppercase block">Database Engine</span>
            <span className="font-mono text-[#173B3F] font-bold">SQLite / PostgreSQL (Auto-switch)</span>
          </div>
          <div className="p-3 bg-[#F7F8F6] rounded-xl border border-[#DCE3E3]">
            <span className="text-[11px] font-semibold text-[#667477] uppercase block">API Framework</span>
            <span className="font-mono text-[#173B3F] font-bold">FastAPI + PyTorch + ReportLab</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
