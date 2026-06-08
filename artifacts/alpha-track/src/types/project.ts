// ============================================================
// MERIDIO V2 — PROJECT OBJECT ARCHITECTURE
// src/types/project.ts
//
// Design principles:
// - Researcher is source of truth. System records, never decides.
// - Timing Window and Next Action are first-class fields.
// - Conviction Notes replace all scoring/verdict systems.
// - Event log is append-only and immutable.
// - Offline-first: all fields serializable to localStorage/IndexedDB.
// - Alert system compatibility built into TimingWindow structure.
// - Schema version field enables future migrations without data loss.
// ============================================================

// ============================================================
// SECTION 1 — LAYER & STATE SYSTEM
// ============================================================

/**
 * Five operational layers. Each represents a distinct cognitive
 * and operational context in the researcher's workflow.
 *
 * NOTE: DROPPED is intentionally NOT a separate layer.
 * It is a completionType within COMPLETED.
 * Reason: dropped projects must remain searchable and
 * referenceable for pattern recognition. A separate layer
 * adds navigation complexity without architectural benefit.
 */
export type Layer =
  | 'RAW'        // High-speed intake and signal triage
  | 'CURATED'    // Conviction incubation and monitoring
  | 'ACTIVE'     // Execution reliability layer — core of Meridio
  | 'RESEARCH'   // Deep intelligence and ecosystem understanding
  | 'COMPLETED'; // Terminal state — warm operational memory

/**
 * Operational states within each layer.
 * Layer = where in workflow. State = how it operates there.
 * These are separate dimensions — never conflate them.
 */
export type RawState =
  | 'New'        // Just entered system, no triage yet
  | 'Reviewing'  // Currently being evaluated
  | 'OnHold';    // Waiting for more signal before decision

export type CuratedState =
  | 'Monitoring'  // Passive watch, no catalyst yet
  | 'Evaluating'  // Conviction actively being built
  | 'Waiting';    // Thesis clear, executable play not yet visible

export type ActiveState =
  | 'Ready'      // Executable play available, not yet started
  | 'Executing'  // Actively being worked on
  | 'Waiting'    // Execution started, waiting for next phase
  | 'Monitoring';// Commitment exists, currently low-activity phase

export type ResearchState =
  | 'InProgress'  // Active research being conducted
  | 'Draft'       // Started but not yet complete
  | 'Complete'    // Thesis fully written, may still update
  | 'Updating';   // Being revised due to significant new development

/**
 * Terminal state for COMPLETED projects.
 * Replaced by completionType — no operational states needed.
 */
export type CompletionType =
  | 'Achieved'   // Execution objective successfully completed
  | 'Expired'    // Timing window closed without execution
  | 'Abandoned'  // Researcher decided not worth continuing after commit
  | 'Dead'       // Project is dead — rug, inactive, defunct
  | 'Dropped';   // Researcher consciously removed from pipeline

/**
 * Union of all valid states. Used for type-safe state assignment.
 * Each layer only accepts its corresponding states.
 */
export type ProjectState =
  | RawState
  | CuratedState
  | ActiveState
  | ResearchState;

// ============================================================
// SECTION 2 — PLAY TYPE
// ============================================================

export type PlayType =
  | 'Airdrop'
  | 'Testnet'
  | 'NFT_WL'         // NFT Whitelist play
  | 'RoleGrinding'   // Discord/community role accumulation
  | 'Campaign'       // Task-based campaign (Galxe, Zealy, etc.)
  | 'FastPlay'       // FCFS or time-critical opportunity
  | 'ResearchOnly'   // No direct play — ecosystem/strategic understanding
  | 'Other';

// ============================================================
// SECTION 3 — TIMING WINDOW (first-class field)
// ============================================================

/**
 * TimingWindow is a first-class field, not optional metadata.
 * It is the foundation of the alert system and urgency grouping.
 *
 * Three window types:
 * - HardDeadline: Fixed cutoff. Miss it and opportunity is gone.
 * - SoftWindow: Target window but some flexibility.
 * - Ongoing: No specific deadline but active monitoring needed.
 */
export type WindowType = 'HardDeadline' | 'SoftWindow' | 'Ongoing';

/**
 * UrgencyLevel is COMPUTED from TimingWindow.deadline, never stored.
 * Computed at render time to ensure it's always current.
 *
 * Calm:    3+ days remaining
 * Elevated: 24–72 hours remaining
 * Critical: < 24 hours remaining
 * Expired: deadline has passed
 */
export type UrgencyLevel = 'Calm' | 'Elevated' | 'Critical' | 'Expired';

/**
 * AlertThreshold tracks the state of each scheduled alert.
 * Stored within TimingWindow for alert system compatibility.
 * Each threshold fires independently — multiple alerts per window.
 */
export interface AlertThreshold {
  hoursBeforeDeadline: number; // e.g., 48, 24, 6, 2
  status: 'Pending' | 'Fired' | 'Acknowledged' | 'Dismissed';
  scheduledFor: string;        // ISO 8601 — when alert should fire
  firedAt?: string;            // ISO 8601 — when actually fired
  acknowledgedAt?: string;     // ISO 8601 — when researcher acknowledged
}

export interface TimingWindow {
  deadline: string;             // ISO 8601 datetime
  windowType: WindowType;
  setAt: string;                // ISO 8601 — when researcher set this
  lastUpdated: string;          // ISO 8601 — last modification
  lastVerifiedAt?: string;      // ISO 8601 — when researcher confirmed still valid
  alertThresholds: AlertThreshold[]; // Alert schedule for this window
  notes?: string;               // Optional context about the window
}

// ============================================================
// SECTION 4 — EVENT LOG (append-only, immutable)
// ============================================================

/**
 * Event types for the immutable historical log.
 * Events are NEVER deleted or modified — only appended.
 *
 * This enables:
 * 1. State reconstruction from scratch if corruption occurs
 * 2. Conviction trajectory visualization
 * 3. Pattern recognition from historical plays
 * 4. Audit trail for debugging alert failures
 */
export type EventType =
  | 'CREATED'              // Project first entered system
  | 'LAYER_CHANGED'        // Promoted or moved between layers
  | 'STATE_CHANGED'        // State changed within same layer
  | 'TIMING_SET'           // Timing window set for first time
  | 'TIMING_UPDATED'       // Timing window modified
  | 'TIMING_VERIFIED'      // Researcher confirmed timing still accurate
  | 'NOTES_UPDATED'        // Conviction notes updated (snapshot of change)
  | 'NEXT_ACTION_SET'      // Next action field set or changed
  | 'ALERT_SCHEDULED'      // Alert scheduled for timing threshold
  | 'ALERT_FIRED'          // Alert notification delivered
  | 'ALERT_ACKNOWLEDGED'   // Researcher opened/acknowledged alert
  | 'ALERT_FAILED'         // Alert failed to deliver (for debugging)
  | 'COMPLETED'            // Project reached terminal COMPLETED state
  | 'MIGRATED';            // Schema migration event (v0 → v1, etc.)

export type EventSource = 'RESEARCHER' | 'SYSTEM' | 'MIGRATION';

export interface ProjectEvent {
  id: string;           // Unique event ID: `${projectId}-${timestamp}-${type}`
  timestamp: string;    // ISO 8601 — when event occurred
  type: EventType;
  source: EventSource;

  // Optional contextual fields depending on event type
  from?: string;        // Previous value (for LAYER_CHANGED, STATE_CHANGED)
  to?: string;          // New value (for LAYER_CHANGED, STATE_CHANGED)
  reason?: string;      // Researcher-provided reason for transition
  snapshot?: string;    // For NOTES_UPDATED: brief snapshot of what changed
  alertThresholdHours?: number; // For ALERT_* events: which threshold
  schemaFrom?: number;  // For MIGRATED events: source schema version
  schemaTo?: number;    // For MIGRATED events: target schema version
}

// ============================================================
// SECTION 5 — TYPE-SPECIFIC TEMPLATE DATA
// ============================================================

/**
 * Template data is additive — it appears based on PlayType.
 * Universal base fields apply to all projects.
 * Template fields appear contextually based on play type.
 * All template fields are optional — partial data is acceptable.
 */

export interface NFTWLTemplate {
  supply?: string;
  mintPrice?: string;           // "Free" or amount with currency
  wlRequirements?: string;      // How to get whitelist
  mintDate?: string;            // ISO 8601 or descriptive date
  artist?: string;
  wlStatus?: 'NotStarted' | 'InProgress' | 'Secured' | 'Missed';
}

export interface FastPlayTemplate {
  hardDeadline?: string;        // ISO 8601
  requirements?: string;        // What's needed to qualify
  actionSteps?: string[];       // Ordered steps for execution
  windowType?: 'FCFS' | 'TimeBased' | 'LimitedSlots';
  rewardType?: string;          // Token, points, NFT, role, etc.
}

export interface ProperProjectTemplate {
  funding?: string;             // Amount and investors
  teamSize?: string;
  docsQuality?: 'None' | 'Basic' | 'Good' | 'Comprehensive';
  tokenStatus?: 'None' | 'Planned' | 'Live';
  communitySize?: string;       // Approximate follower + member count
  builderCredibility?: string;  // Notes on team track record
}

export interface TechStartupTemplate {
  productStage?: 'Ideation' | 'Prototype' | 'Beta' | 'Live';
  betaAccessLink?: string;
  hiringOpportunities?: string; // Relevant open roles
  web3Intersection?: string;    // How this connects to crypto ecosystem
  opportunityType?: string;     // Early access, bounty, contributor program, etc.
}

export type TemplateData =
  | NFTWLTemplate
  | FastPlayTemplate
  | ProperProjectTemplate
  | TechStartupTemplate;
// ============================================================
// SECTION 6 — CORE PROJECT INTERFACE
// ============================================================

/**
 * MeridioProject is the central operational entity.
 * It is NOT a database row. It is NOT a static card.
 *
 * It is a multi-dimensional operational object that contains:
 * - Current operational state (layer, state, urgency)
 * - Researcher's conviction and reasoning (convictionNotes)
 * - Execution context (nextAction, timingWindow)
 * - Complete lifecycle history (events)
 * - Type-specific operational details (templateData)
 *
 * Design constraints:
 * - All fields must be JSON-serializable (offline-first)
 * - No computed fields stored — compute at render time
 * - Conviction is always researcher-owned, never AI-generated
 * - Events are append-only and must never be deleted
 */
export interface MeridioProject {
  // ── IDENTITY ──────────────────────────────────────────────
  id: string;                   // UUID v4
  schemaVersion: number;        // Current: 1. Increment on breaking changes.
  name: string;
  avatar?: string;              // URL to project logo or auto-generated placeholder

  // ── LINKS ─────────────────────────────────────────────────
  xLink?: string;               // Twitter/X profile URL
  website?: string;             // Official website URL

  // ── CLASSIFICATION ────────────────────────────────────────
  chain: string;                // Primary blockchain/network (single value)
  playType: PlayType;
  category?: string;            // Additional ecosystem context (DeFi, Infra, AI, etc.)

  // ── OPERATIONAL LAYER & STATE ─────────────────────────────
  // Layer = WHERE in workflow. State = HOW it operates there.
  // Never conflate these two dimensions.
  layer: Layer;
  state: ProjectState;

  // ── CONVICTION (researcher-owned, free-form) ───────────────
  // This field replaced the old scores + verdict + biasCheck + decisionNote system.
  // It is the primary "why" field — the reasoning behind all decisions.
  // Free-form text because nuance cannot be captured in dropdowns.
  convictionNotes: string;

  // ── EXECUTION CONTEXT (first-class fields) ─────────────────
  // These are first-class fields, not metadata.
  // nextAction: What specifically must be done next.
  // timingWindow: When it needs to happen.
  // Both are required for ACTIVE layer. Optional elsewhere.
  nextAction?: string;          // Single sentence or fragment
  timingWindow?: TimingWindow;

  // ── SIGNALS ───────────────────────────────────────────────
  ctSignal?: string;            // Free-form CT mention (names, context)

  // ── STALE TRACKING ────────────────────────────────────────
  // lastInteractionAt tracks when researcher last actively engaged.
  // Stale condition is COMPUTED from this + layer thresholds, never stored.
  lastInteractionAt: string;    // ISO 8601

  // ── COMPLETION (only populated when layer === 'COMPLETED') ─
  completionType?: CompletionType;
  completionNote?: string;      // Brief researcher note on how play ended
  completedAt?: string;         // ISO 8601

  // ── TYPE-SPECIFIC TEMPLATE DATA ───────────────────────────
  // Optional additional fields based on play type.
  // Structure determined by playType field.
  templateData?: TemplateData;

  // ── IMMUTABLE EVENT LOG ────────────────────────────────────
  // Append-only. Never delete. Never modify existing events.
  // Enables state reconstruction, continuity restoration, pattern recognition.
  events: ProjectEvent[];

  // ── TIMESTAMPS ────────────────────────────────────────────
  createdAt: string;            // ISO 8601 — immutable after creation
  updatedAt: string;            // ISO 8601 — updated on any field change

  // ── MIGRATION METADATA ────────────────────────────────────
  // Preserved from old schema for recovery and reference.
  // Prefixed with underscore to signal non-operational nature.
  _legacyData?: LegacyProjectData;
}

// ============================================================
// SECTION 7 — LEGACY DATA (migration preservation)
// ============================================================

/**
 * Preserved fields from v0 schema (AlphaTrack).
 * Stored alongside new schema for reference and recovery.
 * Not used in any operational logic — reference only.
 */
export interface LegacyProjectData {
  status?: string;              // Old: "Screening" | "Watchlist" | "Active Play" | "Done" | "Skip"
  priority?: string;            // Old: "Low" | "Medium" | "High"
  verdict?: string;             // Old: "Strong Play" | "Watch" | "Ignore"
  conviction?: string;          // Old: "Low" | "Medium" | "High"
  biasCheck?: string;           // Old free-form bias check field
  decisionNote?: string;        // Old decision note (merged into convictionNotes)
  playStatus?: string;          // Old: "Belum Ada" | "Aktif" | "Selesai" | "Skip"
  scores?: {                    // Old 5-component scoring system
    narrative: number;
    builder: number;
    ctSignal: number;
    timing: number;
    execution: number;
  };
  timingWindowEnum?: string;    // Old: "Now" | "This Week" | "Monitor" | "No Rush"
  schemaVersion: 0;             // Always 0 for migrated projects
}

// ============================================================
// SECTION 8 — COMPUTED VALUES (never stored)
// ============================================================

/**
 * These values are computed at render time from stored data.
 * They MUST NEVER be stored in the project object.
 * Storing computed values creates stale data and sync conflicts.
 */

/**
 * Compute current urgency level from timing window and current time.
 * Returns null if no timing window set.
 */
export function computeUrgencyLevel(
  project: MeridioProject,
  now: Date = new Date()
): UrgencyLevel | null {
  if (!project.timingWindow?.deadline) return null;

  const deadline = new Date(project.timingWindow.deadline);
  const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursRemaining < 0) return 'Expired';
  if (hoursRemaining < 24) return 'Critical';
  if (hoursRemaining < 72) return 'Elevated';
  return 'Calm';
}

/**
 * Compute whether a project is stale based on layer-specific thresholds.
 * Returns true if lastInteractionAt exceeds threshold for the layer.
 *
 * Thresholds:
 * - RAW: 7 days
 * - CURATED: 21 days
 * - ACTIVE: 5 days (with timing) / 14 days (monitoring)
 * - RESEARCH: 30 days
 * - COMPLETED: never stale
 */
export const STALE_THRESHOLDS_DAYS: Record<Layer, number> = {
  RAW: 7,
  CURATED: 21,
  ACTIVE: 5,
  RESEARCH: 30,
  COMPLETED: Infinity,
};

export function computeIsStale(
  project: MeridioProject,
  now: Date = new Date()
): boolean {
  if (project.layer === 'COMPLETED') return false;

  const threshold = STALE_THRESHOLDS_DAYS[project.layer];
  const lastInteraction = new Date(project.lastInteractionAt);
  const daysSinceInteraction = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceInteraction > threshold;
}

/**
 * Determine active urgency group for ACTIVE layer sorting.
 * Used by urgency-weighted ACTIVE view.
 */
export type UrgencyGroup = 'CRITICAL' | 'ACTIVE' | 'WAITING' | 'STALE';

export function computeUrgencyGroup(
  project: MeridioProject,
  now: Date = new Date()
): UrgencyGroup {
  if (computeIsStale(project, now)) return 'STALE';
  if (project.state === 'Waiting') return 'WAITING';

  const urgency = computeUrgencyLevel(project, now);
  if (urgency === 'Critical' || urgency === 'Expired') return 'CRITICAL';

  return 'ACTIVE';
}

// ============================================================
// SECTION 9 — LAYER ARCHITECTURE
// ============================================================

/**
 * Layer definitions with entry criteria, exit criteria,
 * required fields, and forbidden states.
 *
 * This is the single source of truth for layer validation logic.
 */

export interface LayerDefinition {
  layer: Layer;
  purpose: string;
  validStates: string[];
  requiredFieldsOnEntry: (keyof MeridioProject)[];
  requiredFieldsForExit: (keyof MeridioProject)[];
  forbiddenTransitions: Layer[];
}

export const LAYER_DEFINITIONS: Record<Layer, LayerDefinition> = {
  RAW: {
    layer: 'RAW',
    purpose: 'High-speed intake and signal triage. Volume buffer before qualification.',
    validStates: ['New', 'Reviewing', 'OnHold'],
    requiredFieldsOnEntry: ['name', 'playType'],
    requiredFieldsForExit: [], // No exit requirements — any decision is valid
    forbiddenTransitions: [], // RAW can exit to any layer
  },

  CURATED: {
    layer: 'CURATED',
    purpose: 'Conviction incubation. Monitoring while waiting for executable play.',
    validStates: ['Monitoring', 'Evaluating', 'Waiting'],
    requiredFieldsOnEntry: ['name', 'playType', 'convictionNotes'],
    requiredFieldsForExit: ['convictionNotes'], // Must have reasoning to promote
    forbiddenTransitions: ['RAW'], // Cannot move backwards by default
  },

  ACTIVE: {
    layer: 'ACTIVE',
    purpose: 'Execution reliability layer. Only projects with concrete, executable plays.',
    validStates: ['Ready', 'Executing', 'Waiting', 'Monitoring'],
    requiredFieldsOnEntry: ['name', 'playType', 'timingWindow', 'nextAction'],
    requiredFieldsForExit: ['completionNote'], // Must explain how play ended
    forbiddenTransitions: ['RAW', 'CURATED'], // Cannot demote — must drop or complete
    // NOTE: ACTIVE → CURATED demotion is architecturally forbidden.
    // If a play disappears, the project should be DROPPED to COMPLETED,
    // not silently moved back. This preserves execution history integrity.
  },

  RESEARCH: {
    layer: 'RESEARCH',
    purpose: 'Deep intelligence workspace. For projects worth understanding deeply without direct play.',
    validStates: ['InProgress', 'Draft', 'Complete', 'Updating'],
    requiredFieldsOnEntry: ['name', 'convictionNotes'], // Must have research intent
    requiredFieldsForExit: [],
    forbiddenTransitions: [],
  },

  COMPLETED: {
    layer: 'COMPLETED',
    purpose: 'Terminal state. Warm operational memory. Fully searchable historical record.',
    validStates: [], // No operational states — terminal
    requiredFieldsOnEntry: ['completionType', 'completionNote'],
    requiredFieldsForExit: [], // Terminal — no exit
    forbiddenTransitions: ['RAW', 'CURATED', 'ACTIVE', 'RESEARCH'], // Cannot leave COMPLETED
  },
};

// ============================================================
// SECTION 10 — STATE TRANSITION RULES
// ============================================================

export type TransitionRisk = 'Safe' | 'RequiresConfirmation' | 'Dangerous' | 'Forbidden';

export interface TransitionRule {
  from: Layer;
  to: Layer;
  risk: TransitionRisk;
  requiredFields?: (keyof MeridioProject)[];
  confirmationMessage?: string;
  warningMessage?: string;
  eventToRecord: EventType;
}

export const TRANSITION_RULES: TransitionRule[] = [
  // ── RAW exits ─────────────────────────────────────────────
  {
    from: 'RAW',
    to: 'CURATED',
    risk: 'Safe',
    requiredFields: ['convictionNotes'],
    eventToRecord: 'LAYER_CHANGED',
  },
  {
    from: 'RAW',
    to: 'ACTIVE',
    risk: 'RequiresConfirmation',
    requiredFields: ['timingWindow', 'nextAction', 'convictionNotes'],
    confirmationMessage: 'Project ini bypass qualification. Pastikan ada executable play yang jelas dan conviction sudah solid.',
    eventToRecord: 'LAYER_CHANGED',
  },
  {
    from: 'RAW',
    to: 'RESEARCH',
    risk: 'Safe',
    requiredFields: ['convictionNotes'],
    eventToRecord: 'LAYER_CHANGED',
  },
  {
    from: 'RAW',
    to: 'COMPLETED',
    risk: 'RequiresConfirmation',
    requiredFields: ['completionType', 'completionNote'],
    confirmationMessage: 'Drop project ini dari pipeline?',
    eventToRecord: 'COMPLETED',
  },

  // ── CURATED exits ─────────────────────────────────────────
  {
    from: 'CURATED',
    to: 'ACTIVE',
    risk: 'RequiresConfirmation',
    requiredFields: ['timingWindow', 'nextAction', 'convictionNotes'],
    confirmationMessage: 'Project ini punya executable play yang jelas dan timing window yang konkret?',
    eventToRecord: 'LAYER_CHANGED',
  },
  {
    from: 'CURATED',
    to: 'RESEARCH',
    risk: 'Safe',
    requiredFields: ['convictionNotes'],
    eventToRecord: 'LAYER_CHANGED',
  },
  {
    from: 'CURATED',
    to: 'COMPLETED',
    risk: 'RequiresConfirmation',
    requiredFields: ['completionType', 'completionNote'],
    confirmationMessage: 'Drop project ini dari pipeline?',
    eventToRecord: 'COMPLETED',
  },
  {
    from: 'CURATED',
    to: 'RAW',
    risk: 'Forbidden', // Cannot move backward
    eventToRecord: 'LAYER_CHANGED',
  },

  // ── ACTIVE exits ──────────────────────────────────────────
  {
    from: 'ACTIVE',
    to: 'COMPLETED',
    risk: 'RequiresConfirmation',
    requiredFields: ['completionType', 'completionNote'],
    confirmationMessage: 'Mark this play as complete?',
    eventToRecord: 'COMPLETED',
  },
  {
    from: 'ACTIVE',
    to: 'RAW',
    risk: 'Forbidden', // Cannot demote from ACTIVE
    eventToRecord: 'LAYER_CHANGED',
  },
  {
    from: 'ACTIVE',
    to: 'CURATED',
    risk: 'Forbidden', // Cannot demote from ACTIVE — drop instead
    // If a play disappears, use COMPLETED + Dropped, not demotion.
    // This preserves the integrity of execution history.
    eventToRecord: 'LAYER_CHANGED',
  },
  {
    from: 'ACTIVE',
    to: 'RESEARCH',
    risk: 'Dangerous',
    warningMessage: 'Moving to RESEARCH means abandoning execution tracking. Are you sure this is not an ACTIVE play anymore?',
    eventToRecord: 'LAYER_CHANGED',
  },

  // ── RESEARCH exits ────────────────────────────────────────
  {
    from: 'RESEARCH',
    to: 'ACTIVE',
    risk: 'RequiresConfirmation',
    requiredFields: ['timingWindow', 'nextAction'],
    confirmationMessage: 'Project ini punya executable play sekarang?',
    eventToRecord: 'LAYER_CHANGED',
  },
  {
    from: 'RESEARCH',
    to: 'COMPLETED',
    risk: 'RequiresConfirmation',
    requiredFields: ['completionType', 'completionNote'],
    confirmationMessage: 'Archive this research?',
    eventToRecord: 'COMPLETED',
  },

  // ── COMPLETED exits ───────────────────────────────────────
  {
    from: 'COMPLETED',
    to: 'RAW',
    risk: 'Forbidden',
    eventToRecord: 'LAYER_CHANGED',
  },
  {
    from: 'COMPLETED',
    to: 'CURATED',
    risk: 'Forbidden',
    eventToRecord: 'LAYER_CHANGED',
  },
  {
    from: 'COMPLETED',
    to: 'ACTIVE',
    risk: 'Forbidden',
    eventToRecord: 'LAYER_CHANGED',
  },
  {
    from: 'COMPLETED',
    to: 'RESEARCH',
    risk: 'Forbidden',
    eventToRecord: 'LAYER_CHANGED',
  },
];

/**
 * Get transition rule for a specific from→to pair.
 * Returns undefined if transition not explicitly defined (assume Forbidden).
 */
export function getTransitionRule(from: Layer, to: Layer): TransitionRule | undefined {
  return TRANSITION_RULES.find(r => r.from === from && r.to === to);
}

/**
 * Validate whether a transition is allowed.
 * Returns validation result with reason if forbidden.
 */
export interface TransitionValidation {
  allowed: boolean;
  risk: TransitionRisk;
  missingFields: string[];
  message?: string;
}

export function validateTransition(
  project: MeridioProject,
  targetLayer: Layer
): TransitionValidation {
  const rule = getTransitionRule(project.layer, targetLayer);

  if (!rule || rule.risk === 'Forbidden') {
    return {
      allowed: false,
      risk: 'Forbidden',
      missingFields: [],
      message: `Transition from ${project.layer} to ${targetLayer} is not allowed.`,
    };
  }

  const missingFields = (rule.requiredFields || []).filter(
    field => !project[field]
  ) as string[];

  return {
    allowed: missingFields.length === 0,
    risk: rule.risk,
    missingFields,
    message: missingFields.length > 0
      ? `Required before this transition: ${missingFields.join(', ')}`
      : rule.confirmationMessage || rule.warningMessage,
  };
}
// ============================================================
// SECTION 11 — DEFAULT STATE PER LAYER
// ============================================================

export const DEFAULT_STATE_PER_LAYER: Record<Layer, ProjectState | null> = {
  RAW: 'New',
  CURATED: 'Monitoring',
  ACTIVE: 'Ready',
  RESEARCH: 'InProgress',
  COMPLETED: null, // Terminal — no operational state
};

// ============================================================
// SECTION 12 — MIGRATION (v0 AlphaTrack → v1 Meridio)
// ============================================================

/**
 * Migration mappings from old schema to new schema.
 * Old schema used: status, priority, verdict, scores, timingWindow (enum),
 * playStatus, conviction, decisionNote, biasCheck.
 */

const STATUS_TO_LAYER: Record<string, Layer> = {
  'Screening':   'RAW',
  'Watchlist':   'CURATED',
  'Active Play': 'ACTIVE',
  'Done':        'COMPLETED',
  'Skip':        'COMPLETED',
};

const STATUS_TO_COMPLETION_TYPE: Record<string, CompletionType> = {
  'Done': 'Achieved',
  'Skip': 'Dropped',
};

const OLD_TIMING_TO_WINDOW_TYPE: Record<string, WindowType> = {
  'Now':       'HardDeadline',
  'This Week': 'SoftWindow',
  'Monitor':   'SoftWindow',
  'No Rush':   'Ongoing',
};

/**
 * Build conviction notes from old schema fields.
 * Merges: decisionNote + conviction level + biasCheck + verdict + narrative + description
 * into a single coherent freeform text field.
 */
function buildConvictionNotes(old: any): string {
  const parts: string[] = [];

  if (old.decisionNote) parts.push(old.decisionNote);
  if (old.conviction) parts.push(`Conviction level: ${old.conviction}`);
  if (old.verdict) parts.push(`Verdict: ${old.verdict}`);
  if (old.biasCheck) parts.push(`Bias check: ${old.biasCheck}`);
  if (old.narrative) parts.push(`Narrative: ${old.narrative}`);
  if (old.description) parts.push(old.description);
  if (old.playNotes) parts.push(old.playNotes);

  return parts.filter(Boolean).join('\n\n');
}

/**
 * Map old TimingWindow enum to new TimingWindow object.
 * Since old schema had no real datetime, we cannot set a real deadline.
 * We preserve the intent in notes and set a placeholder structure.
 */
function mapOldTimingWindow(
  oldValue: string,
  projectId: string
): TimingWindow | undefined {
  if (!oldValue || oldValue === 'No Rush' || oldValue === 'Monitor') {
    return undefined; // These don't need a proper timing window
  }

  const now = new Date().toISOString();
  const windowType = OLD_TIMING_TO_WINDOW_TYPE[oldValue] || 'SoftWindow';

  // For "Now" — set deadline to 24h from migration as placeholder
  // Researcher MUST update this with real deadline
  const deadline = oldValue === 'Now'
    ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 1 week for "This Week"

  return {
    deadline,
    windowType,
    setAt: now,
    lastUpdated: now,
    notes: `[MIGRATED] Original timing: "${oldValue}". Please update with actual deadline.`,
    alertThresholds: [],
  };
}

/**
 * Main migration function.
 * Converts a single v0 (AlphaTrack) project to v1 (Meridio) schema.
 */
export function migrateV0ToV1(old: any): MeridioProject {
  const now = new Date().toISOString();
  const layer: Layer = STATUS_TO_LAYER[old.status] || 'RAW';
  const completionType = STATUS_TO_COMPLETION_TYPE[old.status];

  // Build creation event (backdated to original createdAt)
  const creationEvent: ProjectEvent = {
    id: `${old.id}-evt-created`,
    timestamp: old.createdAt || now,
    type: 'CREATED',
    source: 'MIGRATION',
    reason: 'Initial project creation (backfilled from AlphaTrack v0)',
  };

  // Build migration event
  const migrationEvent: ProjectEvent = {
    id: `${old.id}-evt-migrated`,
    timestamp: now,
    type: 'MIGRATED',
    source: 'MIGRATION',
    from: old.status,
    to: layer,
    schemaFrom: 0,
    schemaTo: 1,
    reason: 'Schema migration from AlphaTrack v0 to Meridio v1',
  };

  // Map old chain (array) to single chain string
  const chain = Array.isArray(old.chain)
    ? (old.chain[0] || 'Unknown')
    : (old.chain || 'Unknown');

  // Map old playType (array) to single PlayType
  const rawPlayType = Array.isArray(old.playType) ? old.playType[0] : old.playType;
  const playType: PlayType = mapOldPlayType(rawPlayType);

  // Map timing window
  const timingWindow = old.timingWindow
    ? mapOldTimingWindow(old.timingWindow, old.id)
    : undefined;

  // Map actionRequired to nextAction
  const nextAction = old.actionRequired || undefined;

  // Build conviction notes from old fields
  const convictionNotes = buildConvictionNotes(old);

  // Build CT signal string from old ProjectCT object
  const ctSignal = old.ct?.names?.length
    ? `${old.ct.names.join(', ')} (${old.ct.count} signals)`
    : undefined;

  const migrated: MeridioProject = {
    id: old.id,
    schemaVersion: 1,
    name: old.name || 'Unnamed Project',
    avatar: undefined, // Will be fetched when user first opens project
    xLink: old.links?.twitter || undefined,
    website: old.links?.website || undefined,
    chain,
    playType,
    category: Array.isArray(old.category) ? old.category[0] : old.category,
    layer,
    state: DEFAULT_STATE_PER_LAYER[layer] as ProjectState,
    convictionNotes,
    nextAction,
    timingWindow,
    ctSignal,
    lastInteractionAt: old.updatedAt || now,
    completionType: completionType || undefined,
    completionNote: completionType
      ? `[MIGRATED] Status was "${old.status}" in AlphaTrack v0.`
      : undefined,
    completedAt: completionType ? (old.updatedAt || now) : undefined,
    templateData: undefined, // Not migrated — researcher fills template fields fresh
    events: [creationEvent, migrationEvent],
    createdAt: old.createdAt || now,
    updatedAt: now,
    _legacyData: {
      status: old.status,
      priority: old.priority,
      verdict: old.verdict,
      conviction: old.conviction,
      biasCheck: old.biasCheck,
      decisionNote: old.decisionNote,
      playStatus: old.playStatus,
      scores: old.scores,
      timingWindowEnum: old.timingWindow,
      schemaVersion: 0,
    },
  };

  return migrated;
}

/**
 * Map old free-form playType strings to new PlayType enum.
 */
function mapOldPlayType(old: string | undefined): PlayType {
  if (!old) return 'Other';
  const lower = old.toLowerCase();
  if (lower.includes('airdrop')) return 'Airdrop';
  if (lower.includes('testnet')) return 'Testnet';
  if (lower.includes('nft') || lower.includes('wl') || lower.includes('whitelist')) return 'NFT_WL';
  if (lower.includes('role')) return 'RoleGrinding';
  if (lower.includes('campaign') || lower.includes('galxe') || lower.includes('zealy')) return 'Campaign';
  if (lower.includes('fast') || lower.includes('fcfs')) return 'FastPlay';
  if (lower.includes('research')) return 'ResearchOnly';
  return 'Other';
}

/**
 * Migrate all projects from localStorage v0 storage key.
 * Returns migrated projects array ready for v1 storage.
 */
export function migrateAllProjects(rawData: any[]): MeridioProject[] {
  if (!Array.isArray(rawData)) return [];
  return rawData.map(project => {
    try {
      return migrateV0ToV1(project);
    } catch (error) {
      console.error(`Migration failed for project ${project?.id}:`, error);
      // Return a minimal valid project rather than losing data
      return {
        id: project?.id || crypto.randomUUID(),
        schemaVersion: 1,
        name: project?.name || 'Migration Error — Check Legacy Data',
        chain: 'Unknown',
        playType: 'Other' as PlayType,
        layer: 'RAW' as Layer,
        state: 'New' as RawState,
        convictionNotes: '',
        lastInteractionAt: new Date().toISOString(),
        events: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _legacyData: { ...project, schemaVersion: 0 },
      } as MeridioProject;
    }
  });
}

// ============================================================
// SECTION 13 — STORAGE KEYS & HELPERS
// ============================================================

export const STORAGE_KEYS = {
  V0: 'alphatrack_v2',           // Old AlphaTrack localStorage key
  V1: 'meridio_v1',              // New Meridio localStorage key
  SCHEMA_VERSION: 'meridio_schema_version',
} as const;

/**
 * Check current schema version in storage.
 * Returns 0 if old AlphaTrack data exists, 1 if already migrated, null if empty.
 */
export function detectSchemaVersion(): 0 | 1 | null {
  if (typeof localStorage === 'undefined') return null;

  const v1Data = localStorage.getItem(STORAGE_KEYS.V1);
  if (v1Data) return 1;

  const v0Data = localStorage.getItem(STORAGE_KEYS.V0);
  if (v0Data) return 0;

  return null;
}

/**
 * Load all projects from storage, running migration if needed.
 */
export function loadProjectsFromStorage(): MeridioProject[] {
  if (typeof localStorage === 'undefined') return [];

  const version = detectSchemaVersion();

  if (version === 1) {
    const raw = localStorage.getItem(STORAGE_KEYS.V1);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as MeridioProject[];
    } catch {
      return [];
    }
  }

  if (version === 0) {
    const raw = localStorage.getItem(STORAGE_KEYS.V0);
    if (!raw) return [];
    try {
      const oldProjects = JSON.parse(raw);
      const migrated = migrateAllProjects(oldProjects);
      // Persist migrated data to new key
      saveProjectsToStorage(migrated);
      return migrated;
    } catch {
      return [];
    }
  }

  return [];
}

/**
 * Save all projects to storage.
 */
export function saveProjectsToStorage(projects: MeridioProject[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.V1, JSON.stringify(projects));
}

/**
 * Generate a new ProjectEvent for a layer transition.
 */
export function createLayerTransitionEvent(
  projectId: string,
  from: Layer,
  to: Layer,
  reason?: string
): ProjectEvent {
  return {
    id: `${projectId}-${Date.now()}-layer`,
    timestamp: new Date().toISOString(),
    type: to === 'COMPLETED' ? 'COMPLETED' : 'LAYER_CHANGED',
    source: 'RESEARCHER',
    from,
    to,
    reason,
  };
}

/**
 * Append an event to a project's event log (immutable append-only).
 * Returns new project with event appended — never mutates original.
 */
export function appendEvent(
  project: MeridioProject,
  event: ProjectEvent
): MeridioProject {
  return {
    ...project,
    events: [...project.events, event],
    updatedAt: event.timestamp,
    lastInteractionAt: event.timestamp,
  };
}
