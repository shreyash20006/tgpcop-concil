import React from 'react';
import { Loader2 } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trendColor: 'orange' | 'green' | 'amber' | 'red' | 'navy';
  loading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon,
  trendColor,
  loading = false,
}) => {
  const getColorStyles = (color: typeof trendColor) => {
    switch (color) {
      case 'orange':
        return {
          bg: 'bg-orange-burnt/10',
          text: 'text-orange-burnt',
          border: 'border-orange-burnt/10',
        };
      case 'green':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-500',
          border: 'border-emerald-500/10',
        };
      case 'amber':
        return {
          bg: 'bg-amber-500/10',
          text: 'text-amber-600',
          border: 'border-amber-500/10',
        };
      case 'red':
        return {
          bg: 'bg-red-500/10',
          text: 'text-red-500',
          border: 'border-red-500/10',
        };
      case 'navy':
      default:
        return {
          bg: 'bg-navy-dark/5',
          text: 'text-navy-dark',
          border: 'border-navy-dark/10',
        };
    }
  };

  const styles = getColorStyles(trendColor);

  return (
    <div className={`bg-white border ${styles.border} p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex items-center justify-between`}>
      {/* Decorative Corner Shape */}
      <div className={`absolute top-0 right-0 w-16 h-16 ${styles.bg} rounded-bl-full opacity-30 pointer-events-none group-hover:scale-110 transition-transform duration-300`} />
      
      <div className="space-y-1.5 z-10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-navy-dark/40 block">
          {label}
        </span>
        {loading ? (
          <Loader2 className="w-6 h-6 text-orange-burnt animate-spin" />
        ) : (
          <span className={`font-display font-extrabold text-3xl block leading-none ${styles.text}`}>
            {value}
          </span>
        )}
      </div>

      <div className={`w-12 h-12 rounded-xl ${styles.bg} ${styles.text} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform z-10`}>
        {icon}
      </div>
    </div>
  );
};

export default StatsCard;
