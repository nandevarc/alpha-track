import { Inbox } from 'lucide-react';
import type { MeridioProject } from '../types/project';
import ProjectCard from '../components/ProjectCard';

interface RawLayerProps {
  projects: MeridioProject[];
}

export default function RawLayer({ projects }: RawLayerProps) {
  const raw = projects
    .filter(p => p.layer === 'RAW')
    .sort((a, b) => {
      const aHasCt = a.ctSignal ? 1 : 0;
      const bHasCt = b.ctSignal ? 1 : 0;
      if (bHasCt !== aHasCt) return bHasCt - aHasCt;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  if (raw.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 gap-3 text-center">
        <Inbox size={40} className="text-muted-foreground opacity-40" strokeWidth={1.2} />
        <div>
          <p className="text-foreground font-medium text-sm">No projects in RAW</p>
          <p className="text-muted-foreground text-xs mt-1">Tap + to add your first project</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {raw.map(p => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}
