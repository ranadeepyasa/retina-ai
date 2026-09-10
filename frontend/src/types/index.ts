export type UserRole = 'HEALTHCARE_WORKER' | 'ADMINISTRATOR';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  facility?: string;
  is_active: boolean;
  created_at: string;
}

export interface Patient {
  id: number;
  patient_code: string;
  age: number;
  sex: string;
  diabetes_duration?: string;
  notes?: string;
  created_at: string;
  screenings_count?: number;
}

export interface Prediction {
  id?: number;
  predicted_class: number; // 0 to 4
  predicted_label: string;
  confidence: number;
  probabilities: Record<string, number>;
  gradcam_image_url?: string;
  model_version: string;
  is_demo_model: boolean;
  interpretation?: string;
  suggested_action?: string;
  created_at?: string;
}

export type ScreeningStatus = 'ANALYZED' | 'PENDING_REVIEW' | 'REVIEWED' | 'REFERRED' | 'CONFIRMED' | 'UNABLE_TO_DETERMINE';
export type ReferralUrgency = 'NONE' | 'ROUTINE' | 'SEMI_URGENT' | 'URGENT';

export interface Screening {
  id: number;
  patient_id: number;
  patient?: {
    id: number;
    patient_code: string;
    age: number;
    sex: string;
    diabetes_duration?: string;
    notes?: string;
  };
  uploaded_image_url: string;
  image_quality: 'GOOD_QUALITY' | 'POOR_QUALITY';
  quality_score: number;
  quality_notes?: string;
  status: ScreeningStatus;
  referral_urgency: ReferralUrgency;
  reviewer_notes?: string | null;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  prediction?: Prediction;
}

export interface QualityCheckResponse {
  image_quality: 'GOOD_QUALITY' | 'POOR_QUALITY';
  quality_score: number;
  is_acceptable: boolean;
  message: string;
  metrics: {
    resolution_width: number;
    resolution_height: number;
    mean_brightness: number;
    contrast_std: number;
    sharpness_score: number;
  };
}

export interface DashboardStats {
  todays_screenings: number;
  pending_review: number;
  referrals_suggested: number;
  total_screenings: number;
  avg_confidence: number;
}

export interface TimeSeriesPoint {
  date: string;
  screenings: number;
  referrals: number;
}

export interface AdminAnalytics {
  total_users: number;
  total_screenings: number;
  screenings_today: number;
  referrals_suggested: number;
  avg_confidence: number;
  severity_distribution: {
    no_dr: number;
    mild: number;
    moderate: number;
    severe: number;
    proliferative: number;
  };
  quality_stats: {
    good_quality: number;
    poor_quality: number;
    good_rate_percent: number;
  };
  screenings_timeline: TimeSeriesPoint[];
}

export interface ModelPerformanceMetrics {
  model_name: string;
  version: string;
  architecture: string;
  is_evaluated: boolean;
  status_message: string;
  accuracy?: number | null;
  precision?: number | null;
  recall?: number | null;
  f1_score?: number | null;
  sensitivity?: number | null;
  specificity?: number | null;
  confusion_matrix?: number[][] | null;
  per_class_metrics?: Record<string, { precision: number; recall: number; f1_score: number }> | null;
}
