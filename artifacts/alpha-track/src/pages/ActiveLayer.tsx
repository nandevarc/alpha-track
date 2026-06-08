import { Zap } from 'lucide-react';
import type { MeridioProject, UrgencyGroup } from '../types/project';
import { computeUrgencyGroup } from '../types/project';
import ProjectCard from '../components/ProjectCard';

interface ActiveLayerProps {
  projects: MeridioProject[];
}

const GROUP_ORDER: UrgencyGroup[] = ['CRITICAL', 'ACTIVE', 'WAITING', 'STALE'];

const GROUP_LABELS: Record<UrgencyGroup, string> = {
  CRITICAL: 'Critical',
  ACTIVE:   'Active',
  WAITING:  'Waiting',
  STALE:    'Stale',
};

const GROUP_COLORS: Record<UrgencyGroup, string> = {
  CRITICAL: 'text-red-500',
  ACTIVE:   'text-emerald-600',
  WAITING:  'text-amber-500',
  STALE:    'text-zinc-400',
};

export default function ActiveLayer({ projects }: ActiveLayerProps) {
  const active = projects.filter(p => p.layer === 'ACTIVE');

  if (active.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 gap-3 text-center">
        <Zap size={40} className="text-muted-foreground opacity-30" strokeWidth={1.2} />
        <div>
          <p className="text-foreground font-medium text-sm">Nothing urgent today</p>
          <p className="text-muted-foreground text-xs mt-1">Your committed plays will appear here</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const grouped: Record<UrgencyGroup, MeridioProject[]> = {
    CRITICAL: [], ACTIVE: [], WAITING: [], STALE: [],
  };

  for (const p of active) {
    grouped[computeUrgencyGroup(p, now)].push(p);
  }

  const urgentCount = grouped.CRITICAL.length;
  const staleCount = grouped.STALE.length;

  return (
    <div className="flex flex-col gap-0">
      {/* Summary bar */}
      <div className="px-4 py-3 flex gap-3 text-xs text-muted-foreground border-b border-border bg-background sticky top-0 z-10">
        <span><span className="text-foreground font-medium">{active.length}</span> Active</span>
        {urgentCount > 0 && (
          <span><span className="text-red-500 font-medium">{urgentCount}</span> Urgent</span>
        )}
        {staleCount > 0 && (
          <span><span className="text-zinc-400 font-medium">{staleCount}</span> Stale</span>
        )}
      </div>

      <div className="flex flex-col gap-0 px-4 py-4">
        {GROUP_ORDER.map(group => {
          const items = grouped[group];
          if (items.length === 0) return null;
          return (
            <div key={group} className="mb-5">
              <p className={`text-[11px] font-semibold uppercase tracking-widest mb-2 ${GROUP_COLORS[group]}`}>
                {GROUP_LABELS[group]}
              </p>
              <div className="flex flex-col gap-3">
                {items.map(p => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
