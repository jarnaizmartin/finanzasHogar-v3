import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { HelpSection } from '../lib/helpCenterData';
import { getManualSections } from '../lib/helpCenterData';

interface UseHelpCenterOptions {
  initialSection?: HelpSection;
  onClose: () => void;
  T: any;
}

export function useHelpCenter({ initialSection, onClose, T }: UseHelpCenterOptions) {
  const [section, setSection] = useState<HelpSection>(initialSection ?? 'home');
  const [manualSection, setManualSection] = useState<string | null>(null);
  const [navigatedAway, setNavigatedAway] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (manualSection) {
          setManualSection(null);
        } else if (section !== 'home') {
          setSection('home');
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [section, manualSection, onClose]);

  const { t } = useTranslation();
  const isMobile = window.innerWidth < 768;

  const sectionTitles = {
    home: { title: t('misc.helpCenter.home'), emoji: '❓' },
    'getting-started': { title: t('misc.helpCenter.gettingStarted'), emoji: '🚀' },
    manual: {
      title: manualSection
        ? getManualSections().find((s) => s.id === manualSection)?.title ?? t('misc.helpCenter.manualFallback')
        : t('misc.helpCenter.manual'),
      emoji: '📖',
    },
    faq: { title: t('misc.helpCenter.faq'), emoji: '💬' },
    shortcuts: { title: t('misc.helpCenter.shortcuts'), emoji: '⌨️' },
  };

  const currentTitle = sectionTitles[section];

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: isMobile && navigatedAway ? 'auto' : '7.5rem',
    bottom: 0,
    right: 0,
    left: isMobile && navigatedAway ? 0 : 'auto',
    width: '100%',
    maxWidth: isMobile ? '100%' : '34rem',
    height: isMobile && navigatedAway ? '45vh' : undefined,
    background: T.cardBg,
    borderLeft: isMobile ? 'none' : `1px solid ${T.cardBorder}`,
    borderTop: `1px solid ${T.cardBorder}`,
    boxShadow: '-8px 0 40px rgba(0,0,0,0.2)',
    zIndex: 60,
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideInRight 0.3s ease both',
    borderRadius: '1rem 0 0 0',
  };

  const headerStyle: React.CSSProperties = {
    padding: isMobile ? '1rem' : '1.25rem 1.5rem',
    borderBottom: `1px solid ${T.cardBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    background: T.headerBg,
    flexShrink: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: isMobile ? '1rem' : '1.25rem 1.5rem',
    paddingBottom: isMobile ? '5rem' : '1.25rem',
  };

  return {
    section,
    setSection,
    manualSection,
    setManualSection,
    navigatedAway,
    setNavigatedAway,
    currentTitle,
    panelStyle,
    headerStyle,
    contentStyle,
  };
}
