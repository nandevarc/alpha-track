import { Inbox, Bookmark, Zap, BookOpen } from 'lucide-react';
import type { Layer } from '../types/project';

type NavLayer = 'RAW' | 'CURATED' | 'ACTIVE' | 'RESEARCH';

interface Tab {
  layer: NavLayer;
  label: string;
  Icon: React.ElementType;
}

const TABS: Tab[] = [
  { layer: 'RAW',      label: 'RAW',      Icon: Inbox },
  { layer: 'CURATED',  label: 'CURATED',  Icon: Bookmark },
  { layer: 'ACTIVE',   label: 'ACTIVE',   Icon: Zap },
  { layer: 'RESEARCH', label: 'RESEARCH', Icon: BookOpen },
];

interface BottomNavProps {
  active: NavLayer;
  counts: Partial<Record<Layer, number>>;
  onSelect: (layer: NavLayer) => void;
}

export default function BottomNav({ active, counts, onSelect }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background border-t border-border flex items-stretch"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map(({ layer, label, Icon }) => {
        const isActive = active === layer;
        const count = layer !== 'RESEARCH' ? (counts[layer] ?? 0) : 0;
        return (
          <button
            key={layer}
            type="button"
            onClick={() => onSelect(layer)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors min-h-[44px]
              ${isActive
                ? 'text-foreground'
                : 'text-muted-foreground'
              }`}
          >
            {/* Active indicator line */}
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-foreground" />
            )}

            <div className="relative">
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={isActive ? 'text-foreground' : 'text-muted-foreground'}
              />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-0.5 rounded-full bg-foreground text-background text-[9px] font-bold flex items-center justify-center leading-none">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </div>

            <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
