import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, UserCheck, EyeOff, FileText } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export const SafetyPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-semibold text-[#2E6F73] uppercase tracking-wider">Medical Ethics & Governance</span>
        <h1 className="text-3xl font-extrabold text-[#173B3F] mt-2">
          Clinical Safety & Limitations
        </h1>
        <p className="text-sm text-[#667477] mt-3 leading-relaxed">
          Clear, medically responsible guidelines on how RetinaAI should be utilized as a decision support tool in healthcare environments.
        </p>
      </div>

      {/* Core Principle Banner */}
      <div className="bg-white p-8 rounded-2xl border-l-4 border-l-[#2E6F73] border border-[#DCE3E3] shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[#2E6F73]">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Core Clinical Principle</span>
        </div>
        <h2 className="text-xl font-bold text-[#173B3F]">
          AI Assists Screening. Clinicians Make the Diagnosis.
        </h2>
        <p className="text-xs sm:text-sm text-[#667477] leading-relaxed">
          RetinaAI is intentionally designed as an <strong>AI-assisted screening and referral decision support tool</strong>, NOT an autonomous medical diagnostic device or replacement for a licensed ophthalmologist, optometrist, or medical specialist.
        </p>
      </div>

      {/* 5 Core Guardrails */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Human-in-the-Loop Interpretation" subtitle="Qualified Oversight Mandatory">
          <p className="text-xs text-[#667477] leading-relaxed">
            All AI outputs—including severity grading, predicted confidence, and Grad-CAM activation overlays—must be reviewed and confirmed by a certified healthcare professional before initiating medical therapy, surgical referral, or invasive treatments.
          </p>
        </Card>

        <Card title="Image Quality Pre-Screening" subtitle="Mandatory Recapture Protocol">
          <p className="text-xs text-[#667477] leading-relaxed">
            Retinal images evaluated as <code>POOR_QUALITY</code> due to insufficient pupil dilation, flash glare, motion artifact, or severe cataract obscuration must be recaptured. Clinicians must not rely on predictions generated from compromised input data.
          </p>
        </Card>

        <Card title="Low-Confidence Handling" subtitle="Conservative Referral Thresholds">
          <p className="text-xs text-[#667477] leading-relaxed">
            Whenever model confidence is intermediate or borderline between stages (e.g. Stage 1 vs Stage 2), the system recommends priority human review and conservative referral planning rather than assuming an absence of disease.
          </p>
        </Card>

        <Card title="Clinical Validation Requirement" subtitle="Pre-Deployment Rigor">
          <p className="text-xs text-[#667477] leading-relaxed">
            Before real-world clinical deployment across state health missions (such as Ayushman Bharat Health & Wellness Centres), local clinical trials and multi-site IRB/ethics committee evaluations are required to validate demographic generalization.
          </p>
        </Card>
      </div>

      {/* What RetinaAI Is vs Is Not */}
      <div className="bg-white p-8 rounded-2xl border border-[#DCE3E3] space-y-6">
        <h3 className="text-lg font-bold text-[#173B3F]">Scope of Operation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#4D8061] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              What RetinaAI Is
            </h4>
            <ul className="space-y-2 text-xs text-[#667477]">
              <li className="flex items-start gap-2">• A point-of-care screening aid for Community Health Officers (CHOs).</li>
              <li className="flex items-start gap-2">• A triaging system to separate low-risk from sight-threatening cases.</li>
              <li className="flex items-start gap-2">• An explainability layer providing visual rationale for referral.</li>
              <li className="flex items-start gap-2">• A standardized PDF reporting tool for tele-ophthalmology handoffs.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#B94A48] uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              What RetinaAI Is Not
            </h4>
            <ul className="space-y-2 text-xs text-[#667477]">
              <li className="flex items-start gap-2">• An autonomous medical device that prescribes treatment or medication.</li>
              <li className="flex items-start gap-2">• A substitute for an in-person slit-lamp biomicroscopy examination.</li>
              <li className="flex items-start gap-2">• A diagnostic tool for systemic conditions without specialist correlation.</li>
              <li className="flex items-start gap-2">• A final legal determination of disease absence or presence.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
