import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Shield, User, Terminal, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const ContactPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-semibold text-[#2E6F73] uppercase tracking-wider">Evaluation & Demonstration</span>
        <h1 className="text-3xl font-extrabold text-[#173B3F] mt-2">
          SIH Demonstration Guide
        </h1>
        <p className="text-sm text-[#667477] mt-3 leading-relaxed">
          Instructions for Smart India Hackathon evaluators to test the end-to-end clinical screening flow, Grad-CAM visualizations, and reporting engine.
        </p>
      </div>

      {/* Demo Credentials Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DCE3E3] shadow-xs space-y-6">
        <h3 className="text-base font-bold text-[#173B3F] flex items-center gap-2">
          <Key className="w-4 h-4 text-[#2E6F73]" />
          Pre-Seeded Demonstration Accounts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#F7F8F6] border border-[#DCE3E3] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#173B3F]">Healthcare Worker</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#DCEDEC] text-[#173B3F] font-semibold">Primary Care</span>
            </div>
            <p className="text-xs text-[#667477]">Use to run new patient screenings, inspect Grad-CAM explanations, and download reports.</p>
            <div className="p-2.5 bg-white rounded-lg border border-[#DCE3E3] font-mono text-xs text-[#173B3F]">
              <div>Email: <strong>worker@retinaai.org</strong></div>
              <div>Password: <strong>demo123</strong></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F8F6] border border-[#DCE3E3] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#173B3F]">Administrator</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#173B3F] text-white font-semibold">Admin Hub</span>
            </div>
            <p className="text-xs text-[#667477]">Use to inspect regional screening analytics, model performance metrics, and manage user accounts.</p>
            <div className="p-2.5 bg-white rounded-lg border border-[#DCE3E3] font-mono text-xs text-[#173B3F]">
              <div>Email: <strong>admin@retinaai.org</strong></div>
              <div>Password: <strong>admin123</strong></div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <Button
            size="md"
            variant="primary"
            onClick={() => navigate('/login')}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Proceed to Login Portal
          </Button>
        </div>
      </div>

      {/* Suggested Evaluation Checklist */}
      <Card title="Suggested Evaluation Pathway" subtitle="Step-by-step verification walkthrough">
        <ul className="space-y-3 text-xs text-[#667477]">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#4D8061] shrink-0 mt-0.5" />
            <span><strong>1. Sign in</strong> with <code>worker@retinaai.org</code>. Inspect the clinical dashboard and top screening stats.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#4D8061] shrink-0 mt-0.5" />
            <span><strong>2. Launch "+ New Screening"</strong>. Select an existing demo patient or enter a new patient code (e.g. <code>PT-901</code>).</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#4D8061] shrink-0 mt-0.5" />
            <span><strong>3. Choose or Upload a fundus image</strong>. Observe the instant automated Image Quality check.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#4D8061] shrink-0 mt-0.5" />
            <span><strong>4. Run Analysis</strong>. Follow the 4-stage progress loader through feature analysis and Grad-CAM generation.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#4D8061] shrink-0 mt-0.5" />
            <span><strong>5. Review Result & Explanation</strong>. Toggle or compare side-by-side Original vs Grad-CAM, view probability bars and referral guidance.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#4D8061] shrink-0 mt-0.5" />
            <span><strong>6. Download Clinical PDF Report</strong>. Inspect the formal ReportLab document with dual image proof and clinical disclaimers.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#4D8061] shrink-0 mt-0.5" />
            <span><strong>7. Switch to Admin</strong>. View the Model Performance page (honestly reading dynamic metrics) and Screening Analytics.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};
