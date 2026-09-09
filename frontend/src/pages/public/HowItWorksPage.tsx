import React from 'react';
import { Camera, Cpu, Eye, Share2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-semibold text-[#2E6F73] uppercase tracking-wider">Clinical Workflow</span>
        <h1 className="text-3xl font-extrabold text-[#173B3F] mt-2">
          From Rural Fundus Camera to Specialist Referral
        </h1>
        <p className="text-sm text-[#667477] mt-3 leading-relaxed">
          How RetinaAI empowers community healthcare workers at Primary Health Centres (PHCs) to conduct reliable, transparent diabetic retinopathy triage.
        </p>
      </div>

      {/* Step by step deep dive */}
      <div className="space-y-8">
        {[
          {
            step: '01',
            title: 'Image Acquisition at Primary Health Centre',
            icon: <Camera className="w-6 h-6 text-[#173B3F]" />,
            tag: 'Hardware-Agnostic Capture',
            desc: 'A non-mydriatic or mydriatic fundus photograph of the patient’s posterior pole is captured using an available low-cost tabletop or portable retinal camera. The image covers the optic disc and macula fovea.',
            details: [
              'Supports standard JPEG/PNG digital inputs',
              'Minimal patient dilation requirement for rapid screening',
              'Operated by trained ASHA, ANM, or Community Health Officer (CHO)'
            ]
          },
          {
            step: '02',
            title: 'Automated Image Quality Assessment',
            icon: <Eye className="w-6 h-6 text-[#2E6F73]" />,
            tag: 'Pre-Inference Safeguard',
            desc: 'Before deep learning classification occurs, the system evaluates illumination, focus sharpness (Laplacian variance), and field-of-view adequacy to prevent misleading predictions caused by motion blur or underexposure.',
            details: [
              'Instant GOOD_QUALITY vs. POOR_QUALITY feedback',
              'Immediate prompt for recapture if focus is inadequate',
              'Reduces false-positive and false-negative screening errors'
            ]
          },
          {
            step: '03',
            title: 'Deep Feature Analysis & Severity Grading',
            icon: <Cpu className="w-6 h-6 text-[#B58A5A]" />,
            tag: 'Lightweight Convolutional CNN',
            desc: 'The preprocessed 224x224 retinal tensor is passed through the classification backbone, outputting calibrated probabilities across all 5 International Clinical Diabetic Retinopathy (ICDR) stages.',
            details: [
              'Stage 0 (No DR) to Stage 4 (Proliferative DR)',
              'Multi-class probability distribution prevents black-box overconfidence',
              'Calibrated confidence scores guide clinician review urgency'
            ]
          },
          {
            step: '04',
            title: 'Visual Explainability with Grad-CAM',
            icon: <Eye className="w-6 h-6 text-[#C98A3D]" />,
            tag: 'Feature Attribution',
            desc: 'Gradient-weighted Class Activation Mapping computes spatial importance weights from the final convolutional feature maps, overlaying a high-resolution saliency heatmap directly onto the retinal image.',
            details: [
              'Reveals whether the network prioritized microaneurysms, hemorrhages, or artifacts',
              'Builds trust between rural healthcare workers and reviewing doctors',
              'Transparent visual evidence included in the referral report'
            ]
          },
          {
            step: '05',
            title: 'Clinical Referral Decision & Tele-Ophthalmology Triage',
            icon: <Share2 className="w-6 h-6 text-[#4D8061]" />,
            tag: 'Structured Referral Action',
            desc: 'A comprehensive, standardized clinical screening report is generated as a signed PDF. Patients requiring follow-up or intervention are triaged into Routine, Semi-urgent, or Urgent referral channels.',
            details: [
              'Standardized referral documentation for district hospitals',
              'Patient screening history tracked longitudinally',
              'Reduces travel hardship for asymptomatic rural patients while prioritizing vision-threatening cases'
            ]
          }
        ].map((item) => (
          <div key={item.step} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DCE3E3] shadow-xs flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-14 h-14 rounded-2xl bg-[#F7F8F6] border border-[#DCE3E3] flex flex-col items-center justify-center shrink-0">
              <span className="text-xs font-black text-[#667477]">{item.step}</span>
              {item.icon}
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#DCEDEC] text-[#173B3F]">
                  {item.tag}
                </span>
                <h3 className="text-base font-bold text-[#173B3F]">{item.title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#667477] leading-relaxed">
                {item.desc}
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                {item.details.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-[#172326]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E6F73] shrink-0" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <Button
          size="lg"
          variant="primary"
          onClick={() => navigate('/login')}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Try the Screening Workflow
        </Button>
      </div>
    </div>
  );
};
