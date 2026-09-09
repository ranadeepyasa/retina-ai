import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye, CheckCircle2, ArrowRight, ShieldCheck, Microscope,
  Sparkles, Layers, FileCheck, Stethoscope, ChevronRight, Activity, Info
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showGradcamPreview, setShowGradcamPreview] = useState(true);

  return (
    <div className="space-y-24 py-8">
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCEDEC] text-[#173B3F] text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#2E6F73]" />
              <span>{t('landing.heroBadge', 'AI-ASSISTED DIABETIC RETINOPATHY SCREENING')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#173B3F] tracking-tight leading-tight">
              {t('landing.heroTitle', 'Bringing Earlier Retinal Screening Closer to Every Community.')}
            </h1>

            <p className="text-base text-[#667477] leading-relaxed max-w-xl">
              {t('landing.heroSubtitle', 'Empowering frontline health workers and primary health centres with explainable deep learning to detect diabetic retinopathy before irreversible vision loss.')}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                size="lg"
                variant="primary"
                onClick={() => navigate('/login')}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {t('landing.startScreening', 'Start a Screening')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/how-it-works')}
              >
                {t('landing.learnMore', 'Explore How It Works')}
              </Button>
            </div>

            {/* Credibility badges */}
            <div className="pt-6 border-t border-[#DCE3E3] flex flex-wrap items-center gap-6 text-xs text-[#667477]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4D8061]" />
                <span>AI-assisted screening</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E6F73]" />
                <span>Explainable result</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B58A5A]" />
                <span>Referral support</span>
              </div>
            </div>
          </div>

          {/* Realistic Retinal Fundus Visualization Hero Graphic */}
          <div className="lg:col-span-5">
            <div className="bg-white p-5 rounded-2xl border border-[#DCE3E3] shadow-lg">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCE3E3]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#4D8061] animate-pulse" />
                  <span className="text-xs font-semibold text-[#173B3F]">Interactive Visualizer</span>
                </div>
                <div className="flex bg-[#F7F8F6] p-0.5 rounded-lg border border-[#DCE3E3] text-[11px]">
                  <button
                    onClick={() => setShowGradcamPreview(false)}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      !showGradcamPreview ? 'bg-white text-[#173B3F] font-semibold shadow-xs' : 'text-[#667477]'
                    }`}
                  >
                    Original Fundus
                  </button>
                  <button
                    onClick={() => setShowGradcamPreview(true)}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      showGradcamPreview ? 'bg-[#173B3F] text-white font-semibold shadow-xs' : 'text-[#667477]'
                    }`}
                  >
                    Grad-CAM Saliency
                  </button>
                </div>
              </div>

              {/* Fundus Visual Canvas Area */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#0A0A0E] flex items-center justify-center border border-[#DCE3E3]">
                <svg className="w-full h-full" viewBox="0 0 300 300">
                  <defs>
                    <radialGradient id="retinaGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#cf5e28" />
                      <stop offset="75%" stopColor="#963311" />
                      <stop offset="100%" stopColor="#3d1405" />
                    </radialGradient>
                    <radialGradient id="opticCup" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#fff2c2" />
                      <stop offset="70%" stopColor="#f3c983" />
                      <stop offset="100%" stopColor="#cf994c" />
                    </radialGradient>
                    <radialGradient id="heat1" cx="62%" cy="48%" r="22%">
                      <stop offset="0%" stopColor="#e63946" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#f4a261" stopOpacity="0.6" />
                      <stop offset="85%" stopColor="#2a9d8f" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#264653" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="heat2" cx="42%" cy="65%" r="18%">
                      <stop offset="0%" stopColor="#e63946" stopOpacity="0.75" />
                      <stop offset="60%" stopColor="#e76f51" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#2a9d8f" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Fundus Background Aperture */}
                  <circle cx="150" cy="150" r="140" fill="url(#retinaGlow)" />

                  {/* Optic Disc (Nasal side) */}
                  <circle cx="85" cy="148" r="22" fill="url(#opticCup)" />
                  <circle cx="85" cy="148" r="10" fill="#fffbe8" />

                  {/* Macula & Fovea (Temporal side) */}
                  <circle cx="195" cy="153" r="26" fill="#691a08" />
                  <circle cx="195" cy="153" r="5" fill="#420f04" />

                  {/* Vascular Trees */}
                  <path d="M85,148 Q120,95 180,82 T260,95" fill="none" stroke="#661005" strokeWidth="3" strokeLinecap="round" />
                  <path d="M85,148 Q120,205 180,218 T260,205" fill="none" stroke="#661005" strokeWidth="3" strokeLinecap="round" />
                  <path d="M85,148 Q55,105 30,70" fill="none" stroke="#661005" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M85,148 Q55,195 30,230" fill="none" stroke="#661005" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Branching vessels */}
                  <path d="M140,88 Q155,60 175,50" fill="none" stroke="#751508" strokeWidth="1.5" />
                  <path d="M140,212 Q155,240 175,250" fill="none" stroke="#751508" strokeWidth="1.5" />

                  {/* Micro-lesions (Microaneurysms and exudates) */}
                  <circle cx="170" cy="130" r="2.5" fill="#4d0505" />
                  <circle cx="215" cy="140" r="2" fill="#4d0505" />
                  <circle cx="180" cy="175" r="3" fill="#ffd166" />
                  <circle cx="190" cy="180" r="2.5" fill="#ffd166" />
                  <ellipse cx="140" cy="170" rx="4" ry="3" fill="#540808" />

                  {/* Grad-CAM Saliency Overlay Layer */}
                  {showGradcamPreview && (
                    <g className="transition-opacity duration-300">
                      <circle cx="150" cy="150" r="140" fill="url(#heat1)" />
                      <circle cx="150" cy="150" r="140" fill="url(#heat2)" />
                    </g>
                  )}
                </svg>

                {/* Overlay Status Pill */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-[#DCE3E3] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#173B3F]">
                      {showGradcamPreview ? 'Grad-CAM Feature Attribution' : 'Raw Fundus Photograph'}
                    </span>
                    <p className="text-[10px] text-[#667477]">
                      {showGradcamPreview ? 'Highlights regions influencing model weights' : 'Field: Posterior pole including optic disc and macula'}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#DCEDEC] text-[#173B3F]">
                    {showGradcamPreview ? 'Stage 2 NPDR' : '224x224 RGB'}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-[#667477] text-center italic">
                Simulated demonstration of explainable fundus activation mapping
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. IMPACT SECTION */}
      <section className="bg-white py-16 border-y border-[#DCE3E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-[#2E6F73] uppercase tracking-wider">Clinical Utility</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#173B3F] mt-1.5">
              Designed for Earlier Detection
            </h2>
            <p className="text-xs sm:text-sm text-[#667477] mt-2">
              Bridging the specialist shortage in rural communities through explainable screening support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#F7F8F6] p-6 rounded-2xl border border-[#DCE3E3] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#DCEDEC] text-[#173B3F] flex items-center justify-center font-bold">
                <Stethoscope className="w-5 h-5 text-[#2E6F73]" />
              </div>
              <h3 className="text-base font-bold text-[#173B3F] uppercase tracking-wide">ACCESS</h3>
              <p className="text-xs text-[#667477] leading-relaxed">
                Support screening where specialist access may be limited. Empower community health workers (CHOs/ASHA/ANMs) with low-cost screening at primary health centres.
              </p>
            </div>

            <div className="bg-[#F7F8F6] p-6 rounded-2xl border border-[#DCE3E3] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#DCEDEC] text-[#173B3F] flex items-center justify-center font-bold">
                <Microscope className="w-5 h-5 text-[#2E6F73]" />
              </div>
              <h3 className="text-base font-bold text-[#173B3F] uppercase tracking-wide">CLARITY</h3>
              <p className="text-xs text-[#667477] leading-relaxed">
                Go beyond a prediction with a visual explanation of the regions influencing the model. Grad-CAM visualizes whether the AI is focusing on actual lesions or artifacts.
              </p>
            </div>

            <div className="bg-[#F7F8F6] p-6 rounded-2xl border border-[#DCE3E3] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#DCEDEC] text-[#173B3F] flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5 text-[#2E6F73]" />
              </div>
              <h3 className="text-base font-bold text-[#173B3F] uppercase tracking-wide">REFERRAL</h3>
              <p className="text-xs text-[#667477] leading-relaxed">
                Help healthcare workers identify patients who may require specialist evaluation. Structured triage reduces unnecessary travel for rural patients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold text-[#2E6F73] uppercase tracking-wider">Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#173B3F] mt-1.5">
            Four Steps from Capture to Care
          </h2>
          <p className="text-xs sm:text-sm text-[#667477] mt-2">
            A seamless primary health center screening pathway designed for real-world clinical operations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Capture',
              desc: 'Obtain a retinal fundus image using a compatible fundus camera.',
              color: 'text-[#173B3F]',
            },
            {
              step: '02',
              title: 'Analyze',
              desc: 'The AI model processes the image and evaluates retinal patterns.',
              color: 'text-[#2E6F73]',
            },
            {
              step: '03',
              title: 'Explain',
              desc: 'Grad-CAM highlights image regions that contributed to the prediction.',
              color: 'text-[#B58A5A]',
            },
            {
              step: '04',
              title: 'Refer',
              desc: 'Use the screening result as decision support for appropriate specialist referral.',
              color: 'text-[#4D8061]',
            },
          ].map((item) => (
            <div key={item.step} className="bg-white p-6 rounded-2xl border border-[#DCE3E3] shadow-xs relative">
              <span className={`text-3xl font-black ${item.color} opacity-30 block mb-2`}>{item.step}</span>
              <h3 className="text-base font-bold text-[#173B3F] mb-1.5">{item.title}</h3>
              <p className="text-xs text-[#667477] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. TECHNOLOGY SECTION */}
      <section className="bg-white py-16 border-y border-[#DCE3E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-[#2E6F73] uppercase tracking-wider">Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#173B3F] mt-1.5">
              Deep Learning with Explainability Built In
            </h2>
            <p className="text-xs sm:text-sm text-[#667477] mt-2">
              End-to-end transparent pipeline combining lightweight convolutional backbones with gradient-weighted feature attribution.
            </p>
          </div>

          {/* Pipeline Diagram Flow */}
          <div className="p-5 bg-[#F7F8F6] rounded-2xl border border-[#DCE3E3] mb-12 overflow-x-auto">
            <div className="min-w-[700px] flex items-center justify-between text-center text-xs font-semibold text-[#173B3F]">
              <div className="px-3 py-2 bg-white rounded-xl border border-[#DCE3E3] shadow-xs">Fundus Image</div>
              <ChevronRight className="w-4 h-4 text-[#667477]" />
              <div className="px-3 py-2 bg-white rounded-xl border border-[#DCE3E3] shadow-xs">Quality Assessment</div>
              <ChevronRight className="w-4 h-4 text-[#667477]" />
              <div className="px-3 py-2 bg-white rounded-xl border border-[#DCE3E3] shadow-xs">Preprocessing</div>
              <ChevronRight className="w-4 h-4 text-[#667477]" />
              <div className="px-3 py-2 bg-[#173B3F] text-white rounded-xl shadow-xs">Deep Learning Classifier</div>
              <ChevronRight className="w-4 h-4 text-[#667477]" />
              <div className="px-3 py-2 bg-white rounded-xl border border-[#DCE3E3] shadow-xs">Severity Prediction</div>
              <ChevronRight className="w-4 h-4 text-[#667477]" />
              <div className="px-3 py-2 bg-[#2E6F73] text-white rounded-xl shadow-xs">Grad-CAM Explanation</div>
              <ChevronRight className="w-4 h-4 text-[#667477]" />
              <div className="px-3 py-2 bg-white rounded-xl border border-[#DCE3E3] shadow-xs">Screening Report</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl border border-[#DCE3E3] bg-[#F7F8F6] space-y-2">
              <Layers className="w-5 h-5 text-[#2E6F73]" />
              <h4 className="text-sm font-bold text-[#173B3F]">Deep Learning</h4>
              <p className="text-xs text-[#667477] leading-relaxed">
                Transfer-learning based image classification for retinal fundus analysis across 5 ICDR severity levels.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#DCE3E3] bg-[#F7F8F6] space-y-2">
              <Microscope className="w-5 h-5 text-[#2E6F73]" />
              <h4 className="text-sm font-bold text-[#173B3F]">Computer Vision</h4>
              <p className="text-xs text-[#667477] leading-relaxed">
                Image preprocessing and quality assessment for more consistent inference and focus validation.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#DCE3E3] bg-[#F7F8F6] space-y-2">
              <Eye className="w-5 h-5 text-[#2E6F73]" />
              <h4 className="text-sm font-bold text-[#173B3F]">Explainable AI</h4>
              <p className="text-xs text-[#667477] leading-relaxed">
                Grad-CAM visualization helps identify regions contributing to model predictions for clinician review.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#DCE3E3] bg-[#F7F8F6] space-y-2">
              <Activity className="w-5 h-5 text-[#2E6F73]" />
              <h4 className="text-sm font-bold text-[#173B3F]">Edge-Ready Architecture</h4>
              <p className="text-xs text-[#667477] leading-relaxed">
                Designed with future offline and resource-constrained deployment in mind for remote rural centres.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CLINICAL SAFETY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#173B3F] text-white p-8 sm:p-12 rounded-3xl relative overflow-hidden">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCEDEC] text-[#173B3F] text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#2E6F73]" />
              <span>CLINICAL SAFETY PRINCIPLES</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              AI Assists Screening. Clinicians Make the Diagnosis.
            </h2>

            <p className="text-sm sm:text-base text-[#DCEDEC] leading-relaxed">
              RetinaAI is intended to support preliminary screening and referral decisions. It does not replace ophthalmologists, clinical examination, or professional diagnosis.
            </p>

            <ul className="space-y-3 pt-2 text-xs sm:text-sm text-gray-200">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#4D8061] shrink-0 mt-0.5" />
                <span>AI output should be interpreted by qualified healthcare professionals.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#4D8061] shrink-0 mt-0.5" />
                <span>Poor-quality images may require recapture to avoid misclassification.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#4D8061] shrink-0 mt-0.5" />
                <span>Low-confidence predictions should be reviewed with priority.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#4D8061] shrink-0 mt-0.5" />
                <span>Clinical validation is required before real-world deployment.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#4D8061] shrink-0 mt-0.5" />
                <span>The prototype must not be presented as an autonomous diagnostic system.</span>
              </li>
            </ul>

            <div className="pt-4">
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/safety')}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Read Full Safety Governance
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TEAM / SIH SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white p-8 rounded-2xl border border-[#DCE3E3] flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-semibold text-[#2E6F73] uppercase tracking-wider">
              Smart India Hackathon Innovation
            </span>
            <h3 className="text-lg font-bold text-[#173B3F] mt-1">
              Explainable AI for Diabetic Retinopathy Screening in Rural India
            </h3>
            <p className="text-xs text-[#667477] mt-1 max-w-xl">
              MedTech / HealthTech domain initiative focused on addressing healthcare disparities through ethical, interpretable deep learning for primary health centers.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/contact')}
            >
              Demo Instructions
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/login')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Launch Portal
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
