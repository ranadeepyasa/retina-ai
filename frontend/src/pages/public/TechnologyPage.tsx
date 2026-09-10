import React from 'react';
import { Cpu, Layers, Microscope, ShieldCheck, Zap } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export const TechnologyPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-semibold text-[#2E6F73] uppercase tracking-wider">Deep Learning & Explainability</span>
        <h1 className="text-3xl font-extrabold text-[#173B3F] mt-2">
          Technology Built Around Transparency
        </h1>
        <p className="text-sm text-[#667477] mt-3 leading-relaxed">
          How transfer learning convolutional neural networks and Gradient-weighted Class Activation Mapping deliver interpretable clinical screening.
        </p>
      </div>

      {/* Model Architecture Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="Convolutional Backbone Architecture" subtitle="EfficientNet-B0 Transfer Learning">
          <div className="space-y-4 text-xs text-[#667477] leading-relaxed">
            <p>
              RetinaAI leverages an <strong>EfficientNet-B0</strong> convolutional network, pre-trained on high-diversity feature representations and fine-tuned for the 5-class International Clinical Diabetic Retinopathy (ICDR) scale.
            </p>
            <div className="p-3 bg-[#F7F8F6] rounded-xl border border-[#DCE3E3] space-y-1.5 font-mono text-[11px] text-[#173B3F]">
              <div>• Input Tensor: 3 x 224 x 224 (RGB, ImageNet normalized)</div>
              <div>• Parameter Count: ~5.3M (Compact footprint for edge inference)</div>
              <div>• Classifier Head: Dropout(0.3) + Linear(1280, 5)</div>
              <div>• Output: 5 Class Softmax Probabilities [0 to 4]</div>
            </div>
            <p>
              The architecture is specifically selected for its balance of high feature extraction fidelity and low FLOPs, making it viable for rural laptop or edge device deployment without requiring costly server GPUs.
            </p>
          </div>
        </Card>

        <Card title="Mathematical Formulation of Grad-CAM" subtitle="Selvaraju et al., Visual Explanations">
          <div className="space-y-4 text-xs text-[#667477] leading-relaxed">
            <p>
              Gradient-weighted Class Activation Mapping (Grad-CAM) uses the gradients of the target class score flowing into the final convolutional layer to produce a coarse localization map highlighting important regions.
            </p>
            <div className="p-3 bg-[#DCEDEC]/50 rounded-xl border border-[#2E6F73]/20 space-y-2 font-mono text-[11px] text-[#173B3F]">
              <div className="font-semibold text-xs">1. Neuron Importance Weights (α):</div>
              <div className="bg-white p-2 rounded border border-[#DCE3E3]">
                {"α_k^c = (1/Z) * Σ_i Σ_j (∂y^c / ∂A_ij^k)"}
              </div>
              <div className="font-semibold text-xs pt-1">2. Heatmap Linear Combination:</div>
              <div className="bg-white p-2 rounded border border-[#DCE3E3]">
                {"L_GradCAM^c = ReLU( Σ_k α_k^c * A^k )"}
              </div>
            </div>
            <p>
              Applying ReLU ensures the visualization reflects only features that have a <em>positive influence</em> on the predicted severity class, filtering out irrelevant negative correlations.
            </p>
          </div>
        </Card>
      </div>

      {/* Why Explainability in Rural Screening */}
      <div className="bg-white p-8 rounded-2xl border border-[#DCE3E3] space-y-6">
        <h3 className="text-lg font-bold text-[#173B3F]">
          Why Visual Explainability is Non-Negotiable in Rural HealthTech
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#667477] leading-relaxed">
          <div className="p-4 rounded-xl bg-[#F7F8F6] border border-[#DCE3E3] space-y-2">
            <ShieldCheck className="w-5 h-5 text-[#2E6F73]" />
            <h4 className="font-bold text-[#173B3F] text-sm">Artifact Verification</h4>
            <p>
              Rural fundus photographs often contain dust spots on lens optics, eyelash shadows, or uneven corneal reflection. Grad-CAM confirms whether the model focused on true lesions or external artifacts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F8F6] border border-[#DCE3E3] space-y-2">
            <Microscope className="w-5 h-5 text-[#2E6F73]" />
            <h4 className="font-bold text-[#173B3F] text-sm">Clinician Review Trust</h4>
            <p>
              When a remote ophthalmologist reviews a referred case via tele-triage, seeing the highlighted regions allows rapid confirmation of microvascular lesions in seconds without starting from scratch.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F8F6] border border-[#DCE3E3] space-y-2">
            <Zap className="w-5 h-5 text-[#2E6F73]" />
            <h4 className="font-bold text-[#173B3F] text-sm">Actionable Referral Evidence</h4>
            <p>
              Including the Grad-CAM visualization directly in the patient referral PDF gives the receiving tertiary hospital an immediate visual rationale for urgency grading.
            </p>
          </div>
        </div>
      </div>

      {/* Edge & Offline Readiness */}
      <div className="bg-[#173B3F] text-white p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#DCEDEC] uppercase tracking-wider">Infrastructure Feasibility</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/20 text-white font-semibold">Future Deployment Capability</span>
          </div>
          <h3 className="text-lg font-bold">Engineered for Low-Bandwidth Rural Settings</h3>
          <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
            Many Primary Health Centres experience intermittent cellular connectivity. The modular PyTorch architecture is designed for future edge deployment using ONNX Runtime, TensorFlow Lite, and 8-bit post-training quantization, enabling fully localized inference on rural clinic laptops or edge devices without continuous internet dependency.
          </p>
        </div>
        <div className="shrink-0 px-4 py-3 bg-white/10 rounded-xl border border-white/20 text-center">
          <span className="text-xl font-bold text-white block">~1.2s</span>
          <span className="text-[10px] text-[#DCEDEC]">Local CPU / Edge Inference</span>
        </div>
      </div>
    </div>
  );
};
