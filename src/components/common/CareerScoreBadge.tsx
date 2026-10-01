import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface CareerScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  tier?: string;
  onClick?: () => void;
}

export const CareerScoreBadge: React.FC<CareerScoreBadgeProps> = ({
  score,
  size = 'md',
  tier,
  onClick,
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <div
      id={`career-score-badge-${score}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`inline-flex items-center rounded-full bg-amber-50/90 border border-amber-200/80 text-amber-900 font-medium transition-colors ${sizeClasses} ${
        onClick ? 'cursor-pointer hover:bg-amber-100 hover:border-amber-300' : ''
      }`}
    >
      <ShieldCheck className={`${iconSizes} text-amber-600 shrink-0`} />
      <span className="font-bold text-amber-950">
        Score {score}
      </span>
      {tier && (
        <span className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider pl-1 border-l border-amber-200">
          {tier}
        </span>
      )}
    </div>
  );
};
