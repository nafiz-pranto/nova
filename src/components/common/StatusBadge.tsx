import React from 'react';
import { 
  Play, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert, 
  HelpCircle, 
  RotateCw,
  Eye,
  GitBranch,
  ShieldCheck
} from 'lucide-react';

export type StandardStatus =
  | 'RUNNING'
  | 'QUEUED'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'FAILED'
  | 'BLOCKED'
  | 'CHALLENGED'
  | 'REVIEW_REQUIRED'
  | 'VERIFIED'
  | 'CONFLICT'
  | 'UNKNOWN';

interface StatusBadgeProps {
  status: StandardStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showPrefix?: boolean;
  className?: string;
}

interface StatusConfig {
  label: string;
  prefix: string;
  icon: React.ComponentType<{ className?: string }>;
  bgClass: string;
  textClass: string;
  borderClass: string;
  accessibleDescription: string;
}

const STATUS_CONFIGS: Record<StandardStatus, StatusConfig> = {
  RUNNING: {
    label: 'Running',
    prefix: '[RUN]',
    icon: RotateCw,
    bgClass: 'bg-blue-50/90',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
    accessibleDescription: 'Process is actively executing and collecting data',
  },
  QUEUED: {
    label: 'Queued',
    prefix: '[QUE]',
    icon: Clock,
    bgClass: 'bg-neutral-100',
    textClass: 'text-neutral-700',
    borderClass: 'border-neutral-300',
    accessibleDescription: 'Item is queued waiting for available worker lease',
  },
  COMPLETED: {
    label: 'Completed',
    prefix: '[OK]',
    icon: CheckCircle2,
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-800',
    borderClass: 'border-emerald-200',
    accessibleDescription: 'Execution finished successfully with all records validated',
  },
  PARTIAL: {
    label: 'Partial Results',
    prefix: '[PRT]',
    icon: AlertTriangle,
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-200',
    accessibleDescription: 'Execution completed partially with pagination end or boundary limits reached',
  },
  FAILED: {
    label: 'Failed',
    prefix: '[ERR]',
    icon: XCircle,
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-800',
    borderClass: 'border-rose-200',
    accessibleDescription: 'Execution encountered an unrecoverable failure',
  },
  BLOCKED: {
    label: 'Blocked',
    prefix: '[BLK]',
    icon: ShieldAlert,
    bgClass: 'bg-red-50',
    textClass: 'text-red-800',
    borderClass: 'border-red-200',
    accessibleDescription: 'Operation blocked by safety, compliance, or access restriction',
  },
  CHALLENGED: {
    label: 'Challenged',
    prefix: '[CHL]',
    icon: ShieldAlert,
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-800',
    borderClass: 'border-purple-200',
    accessibleDescription: 'Anti-bot checkpoint detected; suspended per non-evasion policy',
  },
  REVIEW_REQUIRED: {
    label: 'Review Required',
    prefix: '[REV]',
    icon: Eye,
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-900',
    borderClass: 'border-amber-300',
    accessibleDescription: 'Requires human operator verification and triaging',
  },
  VERIFIED: {
    label: 'Verified',
    prefix: '[VRF]',
    icon: ShieldCheck,
    bgClass: 'bg-teal-50',
    textClass: 'text-teal-800',
    borderClass: 'border-teal-200',
    accessibleDescription: 'Factual evidence and network destination cryptographically and externally verified',
  },
  CONFLICT: {
    label: 'Conflict Detected',
    prefix: '[CNF]',
    icon: GitBranch,
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-800',
    borderClass: 'border-orange-200',
    accessibleDescription: 'Contradictory evidence signals detected between public records',
  },
  UNKNOWN: {
    label: 'Unknown State',
    prefix: '[UNK]',
    icon: HelpCircle,
    bgClass: 'bg-neutral-50',
    textClass: 'text-neutral-600',
    borderClass: 'border-neutral-200',
    accessibleDescription: 'State has not yet been resolved or classified',
  },
};

export const normalizeStatus = (statusStr: string): StandardStatus => {
  const upper = (statusStr || '').toUpperCase().trim();
  if (upper in STATUS_CONFIGS) return upper as StandardStatus;

  // Map existing variations cleanly
  if (['COLLECTING', 'STARTING', 'NAVIGATING', 'VALIDATING'].includes(upper)) return 'RUNNING';
  if (['PAUSED', 'PENDING', 'WAITING'].includes(upper)) return 'QUEUED';
  if (['SUCCESS', 'COMMITTED', 'CONFIRMED', 'QUALIFIED'].includes(upper)) return 'VERIFIED';
  if (['CANCELLED', 'DISQUALIFIED'].includes(upper)) return 'FAILED';
  if (upper.includes('CHALLENGE')) return 'CHALLENGED';
  if (upper.includes('BLOCK')) return 'BLOCKED';
  if (upper.includes('REVIEW') || upper.includes('BORDERLINE')) return 'REVIEW_REQUIRED';
  if (upper.includes('CONFLICT') || upper.includes('FLAGGED')) return 'CONFLICT';
  if (upper.includes('PARTIAL')) return 'PARTIAL';

  return 'UNKNOWN';
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showPrefix = true,
  className = '',
}) => {
  const normStatus = normalizeStatus(status);
  const cfg = STATUS_CONFIGS[normStatus] || STATUS_CONFIGS.UNKNOWN;
  const Icon = cfg.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
    lg: 'text-sm px-2.5 py-1 gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      role="status"
      title={`${cfg.label}: ${cfg.accessibleDescription}`}
      aria-label={`${cfg.label}. ${cfg.accessibleDescription}`}
      className={`inline-flex items-center font-mono font-medium rounded-md border ${cfg.bgClass} ${cfg.textClass} ${cfg.borderClass} ${sizeClasses} ${className} select-none transition-colors`}
    >
      <Icon className={`${iconSizes} shrink-0 ${normStatus === 'RUNNING' ? 'animate-spin' : ''}`} />
      {showPrefix && <span className="opacity-70 font-semibold">{cfg.prefix}</span>}
      <span className="font-sans font-medium tracking-tight whitespace-nowrap">{cfg.label}</span>
      <span className="sr-only">({cfg.accessibleDescription})</span>
    </span>
  );
};
