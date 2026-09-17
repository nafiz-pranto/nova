import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  secondaryActions?: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    disabled?: boolean;
  }>;
  statusBadge?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  breadcrumbs,
  title,
  description,
  primaryAction,
  secondaryActions,
  statusBadge,
  className = '',
}) => {
  return (
    <div className={`mb-6 pb-4 border-b border-neutral-200 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumbs" className="mb-2">
          <ol className="flex items-center flex-wrap gap-1.5 text-xs text-neutral-500 font-medium">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <li key={idx} className="flex items-center gap-1.5">
                  {crumb.onClick && !isLast ? (
                    <button
                      type="button"
                      onClick={crumb.onClick}
                      className="hover:text-neutral-900 transition-colors focus:outline-none focus:underline"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className={isLast ? 'text-neutral-900 font-semibold' : ''}>
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* Main Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              {title}
            </h1>
            {statusBadge}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {(primaryAction || (secondaryActions && secondaryActions.length > 0)) && (
          <div className="flex items-center flex-wrap gap-2 shrink-0 self-start sm:self-center">
            {secondaryActions?.map((sec, idx) => {
              const SecIcon = sec.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={sec.onClick}
                  disabled={sec.disabled}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 hover:text-neutral-900 border border-neutral-200 rounded-lg shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  {SecIcon && <SecIcon className="w-3.5 h-3.5 text-neutral-500" />}
                  <span>{sec.label}</span>
                </button>
              );
            })}

            {primaryAction && (
              <button
                type="button"
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled || primaryAction.loading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                {primaryAction.icon && <primaryAction.icon className="w-3.5 h-3.5" />}
                <span>{primaryAction.loading ? 'Processing...' : primaryAction.label}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
