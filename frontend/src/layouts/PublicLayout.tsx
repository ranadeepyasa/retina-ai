import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Eye, ArrowRight, ShieldCheck, Activity, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { LanguageSelector } from '../components/ui/LanguageSelector';

export const PublicLayout: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F6] text-[#172326]">
      {/* Top Professional Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#DCE3E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-decoration-none">
            <div className="w-9 h-9 rounded-xl bg-[#173B3F] text-white flex items-center justify-center shadow-xs">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-[#173B3F] tracking-tight">RetinaAI</span>
              <span className="block text-[10px] text-[#667477] font-medium leading-none -mt-0.5">
                {t('app.tag', 'Explainable Retinal Screening')}
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#667477]">
            <Link to="/" className="hover:text-[#173B3F] transition-colors">{t('nav.home', 'Home')}</Link>
            <Link to="/how-it-works" className="hover:text-[#173B3F] transition-colors">How It Works</Link>
            <Link to="/technology" className="hover:text-[#173B3F] transition-colors">Technology</Link>
            <Link to="/safety" className="hover:text-[#173B3F] transition-colors">Safety & Ethics</Link>
            <Link to="/contact" className="hover:text-[#173B3F] transition-colors">Demo & Info</Link>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSelector />

            {isAuthenticated ? (
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate(user?.role === 'ADMINISTRATOR' ? '/admin' : '/app')}
                icon={<Activity className="w-3.5 h-3.5" />}
              >
                <span className="hidden sm:inline">Go to </span>{t('nav.dashboard', 'Portal')}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate('/login')}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                <span className="hidden sm:inline">Healthcare </span>{t('nav.login', 'Portal')}
              </Button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#667477] hover:text-[#173B3F] rounded-lg border border-[#DCE3E3]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#DCE3E3] px-4 py-3 space-y-2 shadow-md">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-[#173B3F] hover:bg-[#F7F8F6]"
            >
              Home
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-[#667477] hover:text-[#173B3F] hover:bg-[#F7F8F6]"
            >
              How It Works
            </Link>
            <Link
              to="/technology"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-[#667477] hover:text-[#173B3F] hover:bg-[#F7F8F6]"
            >
              Technology
            </Link>
            <Link
              to="/safety"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-[#667477] hover:text-[#173B3F] hover:bg-[#F7F8F6]"
            >
              Safety & Ethics
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-[#667477] hover:text-[#173B3F] hover:bg-[#F7F8F6]"
            >
              Demo & Info
            </Link>
          </div>
        )}
      </header>

      {/* Main Public Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* High-Integrity Medical Footer */}
      <footer className="bg-white border-t border-[#DCE3E3] pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#173B3F] text-white flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <span className="text-base font-bold text-[#173B3F]">RetinaAI</span>
              </div>
              <p className="text-xs text-[#667477] max-w-md leading-relaxed mb-3">
                Explainable AI for Diabetic Retinopathy Screening in Rural India. 
                Designed as an AI-assisted screening and referral decision support tool for community health workers and primary health centres.
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#DCEDEC]/50 text-[#173B3F] text-[11px] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E6F73]" />
                <span>Smart India Hackathon Prototype | MedTech / HealthTech</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[#173B3F] uppercase tracking-wider mb-3">Platform</h4>
              <ul className="space-y-2 text-xs text-[#667477]">
                <li><Link to="/how-it-works" className="hover:text-[#173B3F]">How It Works</Link></li>
                <li><Link to="/technology" className="hover:text-[#173B3F]">Deep Learning & Grad-CAM</Link></li>
                <li><Link to="/safety" className="hover:text-[#173B3F]">Clinical Safety & Governance</Link></li>
                <li><Link to="/login" className="hover:text-[#173B3F]">Healthcare Worker Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[#173B3F] uppercase tracking-wider mb-3">Resources</h4>
              <ul className="space-y-2 text-xs text-[#667477]">
                <li><Link to="/contact" className="hover:text-[#173B3F]">Documentation & Repo</Link></li>
                <li><a href="/docs" target="_blank" rel="noreferrer" className="hover:text-[#173B3F]">FastAPI Swagger API</a></li>
                <li><Link to="/login" className="hover:text-[#173B3F]">Admin Terminal</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[#DCE3E3] flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#667477]">
            <p className="max-w-2xl text-justify md:text-left leading-normal">
              <strong>MANDATORY CLINICAL DISCLAIMER:</strong> RetinaAI is an AI-assisted screening decision support system. 
              The algorithmic findings and Grad-CAM saliency heatmaps are intended to assist preliminary triage and referral planning. 
              They do NOT constitute an independent clinical diagnosis and must be confirmed by a licensed ophthalmologist or eye-care professional.
            </p>
            <div className="shrink-0 text-center md:text-right">
              &copy; {new Date().getFullYear()} RetinaAI. SIH Solution.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
