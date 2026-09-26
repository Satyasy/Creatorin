import React from 'react';
import { ShieldCheck, Award, Star } from 'lucide-react';

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
  return (
    <div
      id={`career-score-badge-${score}`}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50/90 border border-amber-200/80 text-amber-900 font-medium shadow-2xs transition-all ${
        onClick ? 'cursor-pointer hover:bg-amber-100 hover:border-amber-300' : ''
      }`}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      <span className="text-xs font-bold text-amber-950">
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
