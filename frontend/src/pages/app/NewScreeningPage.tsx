import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud, FileImage, CheckCircle2, AlertTriangle, ArrowRight,
  User, Sparkles, RefreshCw, X, ShieldAlert, AlertCircle, Eye
} from 'lucide-react';
import { screeningService, patientService, resolveImageUrl } from '../../services/api';
import { Patient, QualityCheckResponse } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';

export const NewScreeningPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [patientCode, setPatientCode] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [sex, setSex] = useState('Female');
  const [diabetesDuration, setDiabetesDuration] = useState('4 years');
  const [notes, setNotes] = useState('');

  // Image & QC State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  const [qcResult, setQcResult] = useState<QualityCheckResponse | null>(null);
  const [qcError, setQcError] = useState<string | null>(null);

  // Analysis Progress State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0); // 0 to 4
  const stages = [
    'Preparing retinal image & normalization...',
    'Evaluating microvascular patterns & lesions...',
    'Generating Grad-CAM feature attribution heatmaps...',
    'Compiling clinical referral decision support report...',
  ];

  // Quick Preset Samples for Hackathon Judges
  const samplePresets = [
    { label: 'Normal Retina (No DR)', code: 'DEMO-001', age: 48, sex: 'Female', duration: '3 years', sampleName: 'demo-001_severity_0.jpg' },
    { label: 'Moderate NPDR (Exudates)', code: 'DEMO-002', age: 62, sex: 'Male', duration: '11 years', sampleName: 'demo-002_severity_2.jpg' },
    { label: 'Proliferative DR (Severe)', code: 'DEMO-003', age: 57, sex: 'Female', duration: '16 years', sampleName: 'demo-003_severity_4.jpg' },
  ];

  const handleSelectPreset = async (preset: typeof samplePresets[0]) => {
    setPatientCode(preset.code);
    setAge(preset.age);
    setSex(preset.sex);
    setDiabetesDuration(preset.duration);
    setNotes(`SIH evaluation preset: ${preset.label}`);

    // Fetch sample image from server samples directory
    try {
      const response = await fetch(resolveImageUrl(`/api/images/samples/${preset.sampleName}`));
      if (response.ok) {
        const blob = await response.blob();
        const file = new File([blob], preset.sampleName, { type: 'image/jpeg' });
        handleFileSelection(file);
      }
    } catch (err) {
      console.warn('Could not auto-fetch preset image file', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = async (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setQcResult(null);
    setQcError(null);

    // Run Automated Image Quality Check
    setIsCheckingQuality(true);
    try {
      const qc = await screeningService.checkQuality(file);
      setQcResult(qc);
    } catch (err: any) {
      setQcError(err.response?.data?.detail || 'Quality check failed. Please verify image format.');
    } finally {
      setIsCheckingQuality(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;
    if (!patientCode.trim()) {
      alert('Please provide a Patient ID or select an evaluation preset.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStage(0);

    // Multi-stage visual ticker
    const timer1 = setTimeout(() => setAnalysisStage(1), 600);
    const timer2 = setTimeout(() => setAnalysisStage(2), 1400);
    const timer3 = setTimeout(() => setAnalysisStage(3), 2200);

    try {
      const formData = new FormData();
      formData.append('fundus_image', selectedFile);
      formData.append('patient_code', patientCode.trim().toUpperCase());
      if (age) formData.append('age', age.toString());
      formData.append('sex', sex);
      if (diabetesDuration) formData.append('diabetes_duration', diabetesDuration);
      if (notes) formData.append('notes', notes);

      const result = await screeningService.analyze(formData);

      // Brief pause to allow stage 4 completion
      setTimeout(() => {
        setIsAnalyzing(false);
        navigate(`/app/result/${result.screening_id}`);
      }, 2800);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsAnalyzing(false);
      alert(err.response?.data?.detail || 'Analysis failed. Please check server connection.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-[#173B3F]">New Retinal Screening</h1>
        <p className="text-xs text-[#667477] mt-0.5">
          Step-by-step patient registration, quality pre-check, and explainable AI analysis
        </p>
      </div>

      {/* Quick Fast-Select for Evaluators */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE3E3] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#173B3F] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#2E6F73]" />
            Fast Evaluation Presets (Click to autofill patient & fundus image)
          </span>
          <span className="text-[10px] text-[#667477]">Smart India Hackathon</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {samplePresets.map((p) => (
            <button
              key={p.code}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className="px-3 py-2 text-left rounded-lg bg-[#F7F8F6] hover:bg-[#DCEDEC] border border-[#DCE3E3] transition-colors cursor-pointer"
            >
              <div className="text-xs font-semibold text-[#173B3F]">{p.label}</div>
              <div className="text-[10px] text-[#667477]">
                {p.code} • {p.age}y / {p.sex} • {p.duration}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: Patient Information */}
      <Card title="Step 1: Patient Information" subtitle="Demographics essential for retinal screening risk profiling">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#173B3F] mb-1">
              Patient ID / Code <span className="text-[#B94A48]">*</span>
            </label>
            <input
              type="text"
              required
              value={patientCode}
              onChange={(e) => setPatientCode(e.target.value)}
              placeholder="e.g. PT-4091 or DEMO-001"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DCE3E3] focus:outline-none focus:ring-2 focus:ring-[#2E6F73] bg-[#F7F8F6]/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#173B3F] mb-1">Patient Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
              placeholder="e.g. 58"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DCE3E3] focus:outline-none focus:ring-2 focus:ring-[#2E6F73] bg-[#F7F8F6]/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#173B3F] mb-1">Sex</label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DCE3E3] focus:outline-none focus:ring-2 focus:ring-[#2E6F73] bg-[#F7F8F6]/40 text-[#172326]"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#173B3F] mb-1">Diabetes Duration</label>
            <input
              type="text"
              value={diabetesDuration}
              onChange={(e) => setDiabetesDuration(e.target.value)}
              placeholder="e.g. 6 years"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DCE3E3] focus:outline-none focus:ring-2 focus:ring-[#2E6F73] bg-[#F7F8F6]/40"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#173B3F] mb-1">Clinical Notes (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Patient reports slight blurring in right eye; recent fasting glucose 172 mg/dL"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DCE3E3] focus:outline-none focus:ring-2 focus:ring-[#2E6F73] bg-[#F7F8F6]/40"
            />
          </div>
        </div>
      </Card>

      {/* STEP 2: Fundus Image Upload & Quality Check */}
      <Card title="Step 2: Retinal Fundus Image" subtitle="Compatible with standard tabletop and handheld fundus cameras">
        <div className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#DCE3E3] hover:border-[#2E6F73] bg-[#F7F8F6]/60 hover:bg-[#F7F8F6] p-8 rounded-2xl text-center cursor-pointer transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-12 h-12 rounded-2xl bg-[#DCEDEC] text-[#173B3F] flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6 text-[#2E6F73]" />
            </div>
            <p className="text-sm font-semibold text-[#173B3F]">Upload Retinal Fundus Image</p>
            <p className="text-xs text-[#667477] mt-1">
              Drag and drop your fundus photograph here, or click to browse
            </p>
            <p className="text-[11px] text-[#667477]/80 mt-1">Supports PNG, JPG, JPEG (RGB)</p>
          </div>

          <div className="text-xs text-[#667477] flex items-center gap-2 px-1">
            <ShieldAlert className="w-4 h-4 text-[#2E6F73] shrink-0" />
            <span>Ensure the retina is clearly visible and the image is sufficiently focused before initiating AI inference.</span>
          </div>

          {/* Preview & Quality Assessment Result */}
          {previewUrl && (
            <div className="mt-4 p-4 rounded-xl border border-[#DCE3E3] bg-[#F7F8F6] flex flex-col sm:flex-row gap-5 items-start">
              <div className="relative w-36 h-36 rounded-xl overflow-hidden bg-black shrink-0 border border-[#DCE3E3]">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setQcResult(null);
                  }}
                  className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#173B3F]">
                    {selectedFile?.name}
                  </span>
                  {selectedFile && (
                    <span className="text-[10px] text-[#667477]">
                      {Math.round(selectedFile.size / 1024)} KB
                    </span>
                  )}
                </div>

                {/* Quality Check Feedback */}
                {isCheckingQuality ? (
                  <div className="flex items-center gap-2 text-xs text-[#667477] py-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#2E6F73]" />
                    <span>Evaluating image quality heuristics...</span>
                  </div>
                ) : qcResult ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={qcResult.is_acceptable ? 'success' : 'danger'}
                        size="md"
                      >
                        {qcResult.image_quality === 'GOOD_QUALITY' ? 'GOOD QUALITY' : 'POOR QUALITY'}
                      </Badge>
                      <span className="text-xs font-medium text-[#173B3F]">
                        Score: {Math.round(qcResult.quality_score * 100)}%
                      </span>
                    </div>

                    <p className={`text-xs ${qcResult.is_acceptable ? 'text-[#4D8061]' : 'text-[#B94A48]'} font-medium`}>
                      {qcResult.message}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px] text-[#667477]">
                      <div className="bg-white p-1.5 rounded border border-[#DCE3E3]">
                        Res: {qcResult.metrics.resolution_width}x{qcResult.metrics.resolution_height}
                      </div>
                      <div className="bg-white p-1.5 rounded border border-[#DCE3E3]">
                        Luminance: {qcResult.metrics.mean_brightness}
                      </div>
                      <div className="bg-white p-1.5 rounded border border-[#DCE3E3]">
                        Contrast: {qcResult.metrics.contrast_std}
                      </div>
                      <div className="bg-white p-1.5 rounded border border-[#DCE3E3]">
                        Focus: {qcResult.metrics.sharpness_score}
                      </div>
                    </div>
                  </div>
                ) : qcError ? (
                  <Alert variant="danger">{qcError}</Alert>
                ) : null}
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button
              size="lg"
              variant="primary"
              disabled={!selectedFile || isCheckingQuality || isAnalyzing}
              onClick={handleStartAnalysis}
              icon={<Eye className="w-4 h-4" />}
            >
              Analyze Retinal Image
            </Button>
          </div>
        </div>
      </Card>

      {/* ANALYSIS PROGRESS MODAL OVERLAY */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-[#DCE3E3] shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#DCEDEC] text-[#173B3F] flex items-center justify-center mx-auto">
                <RefreshCw className="w-6 h-6 text-[#2E6F73] animate-spin" />
              </div>
              <h3 className="text-base font-bold text-[#173B3F]">Analyzing Retinal Image...</h3>
              <p className="text-xs text-[#667477]">
                Processing patient {patientCode} through the explainable AI pipeline
              </p>
            </div>

            {/* Stages Stepper */}
            <div className="space-y-3">
              {stages.map((stageText, idx) => {
                const isDone = idx < analysisStage;
                const isCurrent = idx === analysisStage;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 text-xs p-2.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-[#DCEDEC]/50 border-[#2E6F73] text-[#173B3F] font-semibold'
                        : isDone
                        ? 'bg-[#F7F8F6] border-[#DCE3E3] text-[#4D8061]'
                        : 'bg-white border-[#DCE3E3] text-[#667477]/60'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-[#4D8061] shrink-0" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 text-[#2E6F73] animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#DCE3E3] shrink-0" />
                    )}
                    <span>{stageText}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-[#667477] text-center italic">
              Generating Grad-CAM feature attribution heatmaps...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
