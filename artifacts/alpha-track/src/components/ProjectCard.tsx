import type { MeridioProject, Layer } from '../types/project';
import { computeIsStale } from '../types/project';

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  const w = Math.floor(d / 7);
  const mo = Math.floor(d / 30);
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  if (w < 5) return `${w}w ago`;
  return `${mo}mo ago`;
}

const LAYER_BADGE: Record<Layer, { bg: string; text: string; label: string }> = {
  RAW:       { bg: 'bg-zinc-100 dark:bg-zinc-800',   text: 'text-zinc-500 dark:text-zinc-400',   label: 'RAW' },
  CURATED:   { bg: 'bg-blue-50 dark:bg-blue-950',    text: 'text-blue-600 dark:text-blue-400',   label: 'CURATED' },
  ACTIVE:    { bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-600 dark:text-emerald-400', label: 'ACTIVE' },
  RESEARCH:  { bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-600 dark:text-purple-400', label: 'RESEARCH' },
  COMPLETED: { bg: 'bg-zinc-100 dark:bg-zinc-800',   text: 'text-zinc-400 dark:text-zinc-500',   label: 'DONE' },
};

interface ProjectCardProps {
  project: MeridioProject;
  onClick?: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const badge = LAYER_BADGE[project.layer];
  const stale = computeIsStale(project);
  const snippet = project.convictionNotes?.slice(0, 50) ?? '';

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-card border border-border rounded-xl px-4 py-3 min-h-[72px] flex flex-col gap-1.5 active:opacity-80 transition-opacity"
    >
      {/* Row 1: name + layer badge */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-foreground text-sm leading-snug truncate flex-1">
          {project.name}
        </span>
        <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${badge.bg} ${badge.text}`}>
          {badge.label}
        </span>
      </div>

      {/* Row 2: chain + playType */}
      <div className="text-xs text-muted-foreground">
        {[project.chain, project.playType].filter(Boolean).join(' · ')}
      </div>

      {/* Row 3: conviction snippet */}
      {snippet && (
        <div className="text-xs text-muted-foreground italic line-clamp-1">
          {snippet}{project.convictionNotes.length > 50 ? '…' : ''}
        </div>
      )}

      {/* Row 4: stale indicator + relative time */}
      <div className="flex items-center justify-between mt-0.5">
        <div>
          {stale && (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              Stale
            </span>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground">
          {relativeTime(project.createdAt)}
        </span>
      </div>
    </button>
  );
}
