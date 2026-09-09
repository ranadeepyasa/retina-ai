import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, ArrowRight, Stethoscope, ShieldCheck, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { LanguageSelector } from '../../components/ui/LanguageSelector';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleSelection, setRoleSelection] = useState<'HEALTHCARE_WORKER' | 'ADMINISTRATOR'>('HEALTHCARE_WORKER');
  const [error, setError] = useState<string | null>(
    searchParams.get('expired') ? 'Your session has expired. Please sign in again.' : null
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email.trim().toLowerCase(), password.trim());
      // Navigate based on role
      const userStr = localStorage.getItem('retina_user');
      const parsed = userStr ? JSON.parse(userStr) : null;
      if (parsed?.role === 'ADMINISTRATOR') {
        navigate('/admin');
      } else {
        navigate('/app');
      }
    } catch (err: any) {
      if (!err.response) {
        setError('Cannot connect to backend server. Make sure FastAPI is running (http://127.0.0.1:8000) or check your Vercel VITE_API_BASE_URL setting.');
      } else if (err.response.status === 401) {
        setError('Incorrect email or password. For demo, click the "Healthcare Worker" or "Administrator" button below.');
      } else {
        setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Demo account quick filler
  const fillDemoAccount = (role: 'worker' | 'admin') => {
    if (role === 'worker') {
      setEmail('worker@retinaai.org');
      setPassword('demo123');
      setRoleSelection('HEALTHCARE_WORKER');
    } else {
      setEmail('admin@retinaai.org');
      setPassword('admin123');
      setRoleSelection('ADMINISTRATOR');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageSelector />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#173B3F] text-white flex items-center justify-center shadow-xs">
            <Eye className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-[#173B3F] tracking-tight">RetinaAI</span>
        </Link>
        <h2 className="text-xl font-bold text-[#173B3F]">{t('auth.signInTitle', 'Clinical Portal Sign In')}</h2>
        <p className="text-xs text-[#667477] mt-1">
          {t('auth.signInSubtitle', 'Access the AI-assisted diabetic retinopathy screening workstation')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 sm:px-10 rounded-2xl border border-[#DCE3E3] shadow-sm">
          {/* Quick Demo Fill Buttons for SIH Hackathon Evaluators */}
          <div className="mb-6 p-3 bg-[#F7F8F6] rounded-xl border border-[#DCE3E3]">
            <span className="block text-[11px] font-semibold text-[#667477] uppercase tracking-wider mb-2">
              SIH Evaluation Fast-Fill:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('worker')}
                className="flex-1 py-1 px-2 text-xs font-medium bg-white hover:bg-[#DCEDEC] text-[#173B3F] border border-[#DCE3E3] rounded-lg transition-colors cursor-pointer"
              >
                Healthcare Worker
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin')}
                className="flex-1 py-1 px-2 text-xs font-medium bg-white hover:bg-[#DCEDEC] text-[#173B3F] border border-[#DCE3E3] rounded-lg transition-colors cursor-pointer"
              >
                Administrator
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[#B94A48]/10 border border-[#B94A48]/30 flex gap-2 text-xs text-[#B94A48]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector tabs */}
            <div>
              <label className="block text-xs font-semibold text-[#173B3F] mb-1.5">{t('auth.roleLabel', 'Intended Role')}</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#F7F8F6] rounded-xl border border-[#DCE3E3]">
                <button
                  type="button"
                  onClick={() => setRoleSelection('HEALTHCARE_WORKER')}
                  className={`py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    roleSelection === 'HEALTHCARE_WORKER'
                      ? 'bg-white text-[#173B3F] shadow-xs'
                      : 'text-[#667477]'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>{t('auth.roleHealthWorker', 'Healthcare Worker')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoleSelection('ADMINISTRATOR')}
                  className={`py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    roleSelection === 'ADMINISTRATOR'
                      ? 'bg-white text-[#173B3F] shadow-xs'
                      : 'text-[#667477]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('auth.roleAdmin', 'Administrator')}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173B3F] mb-1">{t('auth.emailLabel', 'Email Address')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.org"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DCE3E3] focus:outline-none focus:ring-2 focus:ring-[#2E6F73] focus:border-transparent bg-[#F7F8F6]/30"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#173B3F]">{t('auth.passwordLabel', 'Password')}</label>
                <Link to="/forgot-password" className="text-xs text-[#2E6F73] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DCE3E3] focus:outline-none focus:ring-2 focus:ring-[#2E6F73] focus:border-transparent bg-[#F7F8F6]/30"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={loading}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                {t('auth.signInButton', 'Sign In to Platform')}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-[#DCE3E3] text-center text-xs text-[#667477]">
            <span>{t('auth.noAccount', "Don't have an account?")} </span>
            <Link to="/register" className="font-semibold text-[#2E6F73] hover:underline">
              {t('auth.createAccount', 'Create account')}
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-[#667477] hover:text-[#173B3F]">
            ← {t('common.back', 'Return to public website')}
          </Link>
        </div>
      </div>
    </div>
  );
};
