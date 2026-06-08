import { BookOpen } from 'lucide-react';

export default function ResearchLayer() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 gap-3 text-center">
      <BookOpen size={40} className="text-muted-foreground opacity-40" strokeWidth={1.2} />
      <div>
        <p className="text-foreground font-medium text-sm">Research</p>
        <p className="text-muted-foreground text-xs mt-1">Coming soon</p>
      </div>
    </div>
  );
}
