import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageInfo } from '../../i18n';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'navbar' | 'compact' | 'drawer';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  variant = 'navbar',
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangCode = i18n.language || 'en';
  const currentLanguage =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === currentLangCode) ||
    SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang: LanguageInfo) => {
    i18n.changeLanguage(lang.code);
    setIsOpen(false);
  };

  if (variant === 'drawer') {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <label className="text-xs font-semibold text-[#5A6E67] uppercase tracking-wider px-2 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-[#2E6F73]" />
          {t('language.current', 'Language')} / భాష
        </label>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5]">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLangCode;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-[#2E6F73] text-white shadow-sm'
                    : 'text-[#1B3634] hover:bg-white/80'
                }`}
              >
                <div className="text-left truncate">
                  <div className="font-semibold leading-tight">{lang.nativeName}</div>
                  <div className={`text-[10px] leading-tight ${isSelected ? 'text-white/80' : 'text-[#7B8C86]'}`}>
                    {lang.name}
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 ml-1 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={t('language.select', 'Select Language')}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] hover:bg-white text-[#1B3634] text-xs font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2E6F73]/30 ${
          isOpen ? 'ring-2 ring-[#2E6F73]/30 bg-white border-[#2E6F73]' : ''
        }`}
      >
        <Globe className="w-4 h-4 text-[#2E6F73] shrink-0" />
        <span className="font-semibold text-[#1B3634]">
          {currentLanguage.nativeName}
        </span>
        <span className="hidden sm:inline text-[#7B8C86] text-[11px]">
          ({currentLanguage.name})
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#5A6E67] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#2E6F73]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-64 rounded-2xl bg-white border border-[#E5DFD5] shadow-xl py-2 z-50 animate-in fade-in-50 slide-in-from-top-1 duration-150 max-h-[80vh] overflow-y-auto">
          <div className="px-3 py-1.5 border-b border-[#E5DFD5]/60 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A6E67]">
              {t('language.select', 'Select Language')} (12 Languages)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-0.5 px-1.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLangCode;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                    isSelected
                      ? 'bg-[#2E6F73]/10 text-[#2E6F73] font-semibold'
                      : 'text-[#1B3634] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium leading-tight">
                      {lang.nativeName}
                    </div>
                    <div className="text-[11px] text-[#7B8C86] leading-tight">
                      {lang.name}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#2E6F73] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
