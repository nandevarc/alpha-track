import { useState, useEffect, useRef, useCallback } from 'react';
import type { PlayType } from '../types/project';
import { createProject } from '../lib/projectFactory';
import { upsertProject } from '../lib/storage';

// ── Play type display map ─────────────────────────────────────
const PLAY_TYPES: { value: PlayType; label: string }[] = [
  { value: 'Airdrop',      label: 'Airdrop' },
  { value: 'Testnet',      label: 'Testnet' },
  { value: 'NFT_WL',       label: 'NFT / WL' },
  { value: 'RoleGrinding', label: 'Role Grind' },
  { value: 'Campaign',     label: 'Campaign' },
  { value: 'FastPlay',     label: 'Fast Play' },
  { value: 'ResearchOnly', label: 'Research' },
  { value: 'Other',        label: 'Other' },
];

// ── URL → name hint ───────────────────────────────────────────
function extractNameFromUrl(raw: string): string {
  try {
    const withProto = raw.startsWith('http') ? raw : `https://${raw}`;
    const host = new URL(withProto).hostname.replace(/^www\./, '');
    const parts = host.split('.');
    if (parts.length >= 2) {
      const name = parts[parts.length - 2];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return parts[0] ?? '';
  } catch {
    return '';
  }
}

// ── Props ──────────────────────────────────────────────────────
interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSaved: () => void;
}

export default function CaptureModal({ isOpen, onClose, onProjectSaved }: CaptureModalProps) {
  // ── Slide animation ────────────────────────────────────────
  const [visible, setVisible] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);

  useEffect(() => {
    if (!isOpen) { setVisible(false); return; }
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, [isOpen]);

  const closeWithAnimation = useCallback((force = false) => {
    setVisible(false);
    setTimeout(() => {
      onClose();
      resetForm();
    }, 280);
  }, [onClose]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Form state ─────────────────────────────────────────────
  const [url, setUrl]           = useState('');
  const [name, setName]         = useState('');
  const [chain, setChain]       = useState('');
  const [playType, setPlayType] = useState<PlayType | null>(null);
  const [xLink, setXLink]       = useState('');
  const [website, setWebsite]   = useState('');
  const [notes, setNotes]       = useState('');
  const [nameFromUrl, setNameFromUrl] = useState(''); // last auto-fill value
  const [triedSave, setTriedSave]     = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function resetForm() {
    setUrl(''); setName(''); setChain(''); setPlayType(null);
    setXLink(''); setWebsite(''); setNotes(''); setNameFromUrl('');
    setTriedSave(false); setShowDiscard(false);
  }

  // ── URL debounce → name hint ───────────────────────────────
  function handleUrlChange(val: string) {
    setUrl(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const hint = extractNameFromUrl(val.trim());
      if (hint) {
        // Only auto-fill if name is empty or was previously auto-filled from URL
        setName(prev => (prev === '' || prev === nameFromUrl) ? hint : prev);
        setNameFromUrl(hint);
      }
    }, 500);
  }

  // ── Dirty check ─────────────────────────────────────────────
  const isDirty = name.trim() !== '' || playType !== null;

  // ── Overlay tap ─────────────────────────────────────────────
  function handleOverlayClick() {
    if (isDirty) {
      setShowDiscard(true);
    } else {
      closeWithAnimation();
    }
  }

  // ── Save ────────────────────────────────────────────────────
  function handleSave() {
    setTriedSave(true);
    if (!name.trim() || !playType) return;

    const project = createProject(name.trim(), playType, 'RAW');
    // Direct assignment allowed here: building object BEFORE first save
    if (chain.trim())   project.chain            = chain.trim();
    if (xLink.trim())   project.xLink            = xLink.trim();
    if (website.trim()) project.website          = website.trim();
    if (notes.trim())   project.convictionNotes  = notes.trim();

    upsertProject(project);
    closeWithAnimation();
    // Refresh happens via onProjectSaved after animation
    setTimeout(() => onProjectSaved(), 290);
  }

  // ── Disabled state ──────────────────────────────────────────
  const canSave = name.trim().length > 0 && playType !== null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-280"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={handleOverlayClick}
      />

      {/* Sheet */}
      <div
        className="relative bg-background rounded-t-2xl flex flex-col"
        style={{
          maxHeight: '90dvh',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 280ms cubic-bezier(0.32, 0.72, 0, 1)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Discard confirmation overlay */}
        {showDiscard && (
          <div className="absolute inset-0 z-10 bg-background/96 rounded-t-2xl flex flex-col items-center justify-center gap-5 px-8">
            <p className="text-sm font-medium text-foreground">Discard changes?</p>
            <div className="flex gap-3 w-full">
              <button
                className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-foreground"
                onClick={() => setShowDiscard(false)}
              >
                Keep editing
              </button>
              <button
                className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium"
                onClick={() => { setShowDiscard(false); closeWithAnimation(true); }}
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Scrollable form content */}
        <div className="overflow-y-auto flex-1 px-4 pt-2 pb-3 flex flex-col gap-4">

          {/* FIELD 1 — URL */}
          <input
            type="url"
            inputMode="url"
            placeholder="Paste project URL..."
            value={url}
            onChange={e => handleUrlChange(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
          />

          {/* FIELD 2 — Name */}
          <div className="flex flex-col gap-1">
            <input
              type="text"
              placeholder="Project name"
              value={name}
              onChange={e => setName(e.target.value)}
              className={`w-full h-11 px-3 rounded-xl border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20
                ${triedSave && !name.trim() ? 'border-destructive' : 'border-border'}`}
            />
            {triedSave && !name.trim() && (
              <p className="text-xs text-destructive px-1">Name is required</p>
            )}
          </div>

          {/* FIELD 3 — Chain */}
          <input
            type="text"
            placeholder="Chain (e.g. Solana, Base, Aptos...)"
            value={chain}
            onChange={e => setChain(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
          />

          {/* FIELD 4 — Play Type */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {PLAY_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPlayType(value)}
                  className={`h-9 px-3 rounded-lg text-xs font-medium border transition-colors
                    ${playType === value
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background text-muted-foreground border-border'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {triedSave && !playType && (
              <p className="text-xs text-destructive px-1">Select a play type</p>
            )}
          </div>

          {/* FIELD 5 — X Link */}
          <input
            type="url"
            inputMode="url"
            placeholder="Twitter / X URL"
            value={xLink}
            onChange={e => setXLink(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
          />

          {/* FIELD 6 — Website */}
          <input
            type="url"
            inputMode="url"
            placeholder="Website URL"
            value={website}
            onChange={e => setWebsite(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
          />

          {/* FIELD 7 — Notes */}
          <textarea
            placeholder="Notes..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 resize-none min-h-[80px]"
          />

          {/* Save button — inside scroll container so keyboard can't hide it */}
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={`w-full h-12 rounded-xl text-sm font-semibold transition-opacity
              ${canSave
                ? 'bg-foreground text-background'
                : 'bg-foreground/20 text-foreground/40'
              }`}
          >
            Add to RAW
          </button>

          {/* Extra padding so button clears keyboard on iOS scroll */}
          <div className="h-2" />
        </div>
      </div>
    </div>
  );
}
