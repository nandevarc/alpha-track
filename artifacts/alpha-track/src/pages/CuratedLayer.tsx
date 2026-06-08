import { Bookmark } from 'lucide-react';
import type { MeridioProject } from '../types/project';
import ProjectCard from '../components/ProjectCard';

interface CuratedLayerProps {
  projects: MeridioProject[];
}

export default function CuratedLayer({ projects }: CuratedLayerProps) {
  const curated = projects
    .filter(p => p.layer === 'CURATED')
    .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());

  if (curated.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 gap-3 text-center">
        <Bookmark size={40} className="text-muted-foreground opacity-40" strokeWidth={1.2} />
        <div>
          <p className="text-foreground font-medium text-sm">No projects in Curated</p>
          <p className="text-muted-foreground text-xs mt-1">Projects move here when you're monitoring them</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {curated.map(p => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}
