import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Eye, LayoutDashboard, PlusCircle, History, Users, FileText,
  ShieldAlert, Settings, LogOut, Menu, X, BarChart3, Cpu, UserCheck, AlertTriangle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LanguageSelector } from '../components/ui/LanguageSelector';

export const AppLayout: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const workerNav = [
    { name: t('nav.dashboard', 'Dashboard'), path: '/app', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: t('nav.newScreening', 'New Screening'), path: '/app/new-screening', icon: <PlusCircle className="w-4 h-4" /> },
    { name: t('nav.history', 'Screening History'), path: '/app/history', icon: <History className="w-4 h-4" /> },
    { name: t('nav.patients', 'Patients'), path: '/app/patients', icon: <Users className="w-4 h-4" /> },
    { name: t('nav.reports', 'Reports'), path: '/app/reports', icon: <FileText className="w-4 h-4" /> },
  ];

  const adminNav = [
    { name: t('nav.admin', 'Admin Overview'), path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Users & Roles', path: '/admin/users', icon: <UserCheck className="w-4 h-4" /> },
    { name: t('nav.analytics', 'Screening Analytics'), path: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { name: t('nav.modelPerformance', 'Model Performance'), path: '/admin/model-performance', icon: <Cpu className="w-4 h-4" /> },
    { name: t('nav.settings', 'System Settings'), path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const currentNav = location.pathname.startsWith('/admin') ? adminNav : workerNav;

  return (
    <div className="min-h-screen flex bg-[#F7F8F6]">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Professional Clinical Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-[#DCE3E3] flex flex-col justify-between transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 px-6 border-b border-[#DCE3E3] flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#173B3F] text-white flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base font-bold text-[#173B3F] tracking-tight">RetinaAI</span>
                <span className="block text-[9px] text-[#667477] font-medium leading-none">
                  Clinical Screening Platform
                </span>
              </div>
            </Link>
            <button
              className="md:hidden p-1 text-[#667477]"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section Switcher for Admins */}
          {isAdmin && (
            <div className="px-4 pt-4">
              <div className="p-1 bg-[#F7F8F6] rounded-xl flex gap-1 text-xs font-medium">
                <button
                  onClick={() => navigate('/app')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-colors cursor-pointer ${
                    !location.pathname.startsWith('/admin')
                      ? 'bg-white text-[#173B3F] shadow-xs'
                      : 'text-[#667477] hover:text-[#173B3F]'
                  }`}
                >
                  Clinical
                </button>
                <button
                  onClick={() => navigate('/admin')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-colors cursor-pointer ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-white text-[#173B3F] shadow-xs'
                      : 'text-[#667477] hover:text-[#173B3F]'
                  }`}
                >
                  Admin Hub
                </button>
              </div>
            </div>
          )}

          {/* Nav Links */}
          <nav className="p-4 space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#667477] mb-2">
              {location.pathname.startsWith('/admin') ? 'Administration' : 'Clinical Care'}
            </p>
            {currentNav.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#173B3F] text-white'
                      : 'text-[#667477] hover:text-[#173B3F] hover:bg-[#F7F8F6]'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout Bottom Bar */}
        <div className="p-4 border-t border-[#DCE3E3]">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#DCEDEC] text-[#173B3F] flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-[#173B3F] truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-[#667477] truncate">{user?.facility || user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-[#B94A48] hover:bg-[#B94A48]/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('nav.logout', 'Sign Out')}</span>
          </button>
        </div>
      </aside>

      {/* Right Column: Top Bar + Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-[#DCE3E3] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 text-[#667477] hover:text-[#173B3F] rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs text-[#667477] hidden sm:block">
              {location.pathname.startsWith('/admin') ? 'Administration & Model Governance' : 'Tele-Ophthalmology Screening Support'}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSelector />

            {/* Demo Mode Notice Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C98A3D]/10 text-[#C98A3D] text-[11px] font-semibold border border-[#C98A3D]/30">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span className="hidden xs:inline">DEMO MODE (SIH Prototype)</span>
              <span className="xs:hidden">SIH DEMO</span>
            </div>
          </div>
        </header>

        {/* Global Demo Mode Warning Banner */}
        <div className="bg-[#DCEDEC]/40 border-b border-[#2E6F73]/20 px-4 sm:px-6 py-2 text-[11px] text-[#173B3F] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold px-1.5 py-0.5 bg-[#2E6F73] text-white rounded text-[10px] shrink-0">NOTICE</span>
            <span className="truncate sm:whitespace-normal">
              {t('app.disclaimer', 'All AI severity predictions are preliminary screening recommendations and require clinical confirmation by an ophthalmologist.')}
            </span>
          </div>
          <Link to="/safety" className="underline text-[#2E6F73] hover:text-[#173B3F] hidden md:inline shrink-0">
            Read Safety Guidelines
          </Link>
        </div>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
