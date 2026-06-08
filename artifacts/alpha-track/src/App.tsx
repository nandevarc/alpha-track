import { useState, useEffect } from 'react';
import { ToastProvider } from '@/context/ToastContext';
import BottomNav from '@/components/BottomNav';
import RawLayer from '@/pages/RawLayer';
import CuratedLayer from '@/pages/CuratedLayer';
import ActiveLayer from '@/pages/ActiveLayer';
import ResearchLayer from '@/pages/ResearchLayer';
import { getProjects } from '@/lib/storage';
import type { MeridioProject } from '@/types/project';

type NavLayer = 'RAW' | 'CURATED' | 'ACTIVE' | 'RESEARCH';

const LAYER_TITLES: Record<NavLayer, string> = {
  RAW:      'RAW',
  CURATED:  'CURATED',
  ACTIVE:   'ACTIVE',
  RESEARCH: 'RESEARCH',
};

function Shell() {
  const [active, setActive] = useState<NavLayer>('RAW');
  const [projects, setProjects] = useState<MeridioProject[]>([]);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const counts = {
    RAW:     projects.filter(p => p.layer === 'RAW').length,
    CURATED: projects.filter(p => p.layer === 'CURATED').length,
    ACTIVE:  projects.filter(p => p.layer === 'ACTIVE').length,
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 h-12 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-wide text-foreground">
          {LAYER_TITLES[active]}
        </span>
        <span className="text-xs font-bold tracking-[0.15em] text-muted-foreground">
          MERIDIO
        </span>
      </header>

      {/* Content */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: '4rem' }}
      >
        {active === 'RAW'      && <RawLayer projects={projects} />}
        {active === 'CURATED'  && <CuratedLayer projects={projects} />}
        {active === 'ACTIVE'   && <ActiveLayer projects={projects} />}
        {active === 'RESEARCH' && <ResearchLayer />}
      </main>

      <BottomNav active={active} counts={counts} onSelect={setActive} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  );
}
