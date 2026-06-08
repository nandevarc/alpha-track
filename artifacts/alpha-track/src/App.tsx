import { useState, useEffect, useCallback } from 'react';
import { ToastProvider } from '@/context/ToastContext';
import BottomNav from '@/components/BottomNav';
import CaptureModal from '@/components/CaptureModal';
import RawLayer from '@/pages/RawLayer';
import CuratedLayer from '@/pages/CuratedLayer';
import ActiveLayer from '@/pages/ActiveLayer';
import ResearchLayer from '@/pages/ResearchLayer';
import { getProjects } from '@/lib/storage';
import type { MeridioProject } from '@/types/project';
import { Plus } from 'lucide-react';

type NavLayer = 'RAW' | 'CURATED' | 'ACTIVE' | 'RESEARCH';

const LAYER_TITLES: Record<NavLayer, string> = {
  RAW:      'RAW',
  CURATED:  'CURATED',
  ACTIVE:   'ACTIVE',
  RESEARCH: 'RESEARCH',
};

function Shell() {
  const [active, setActive]           = useState<NavLayer>('RAW');
  const [projects, setProjects]       = useState<MeridioProject[]>([]);
  const [captureOpen, setCaptureOpen] = useState(false);

  const refreshProjects = useCallback(() => {
    setProjects(getProjects());
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

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

      {/* Content — must clear both header (48px) and bottom nav (64px) */}
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: '64px' }}>
        {active === 'RAW'      && <RawLayer projects={projects} />}
        {active === 'CURATED'  && <CuratedLayer projects={projects} />}
        {active === 'ACTIVE'   && <ActiveLayer projects={projects} />}
        {active === 'RESEARCH' && <ResearchLayer />}
      </main>

      {/* Floating add button */}
      <button
        type="button"
        aria-label="Add project"
        onClick={() => setCaptureOpen(true)}
        className="fixed z-40 rounded-full flex items-center justify-center shadow-lg bg-foreground text-background active:opacity-80 transition-opacity"
        style={{
          width: 52,
          height: 52,
          bottom: 80,   // 64px nav + 16px gap
          right: 16,
        }}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <BottomNav active={active} counts={counts} onSelect={setActive} />

      <CaptureModal
        isOpen={captureOpen}
        onClose={() => setCaptureOpen(false)}
        onProjectSaved={refreshProjects}
      />
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
