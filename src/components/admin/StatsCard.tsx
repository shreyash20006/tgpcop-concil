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
          bg: 'bg-orange-burnt/10 border-orange-burnt/25',
          text: 'text-orange-burnt',
        };
      case 'green':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/25',
          text: 'text-emerald-400',
        };
      case 'amber':
        return {
          bg: 'bg-amber-500/10 border-amber-500/25',
          text: 'text-amber-400',
        };
      case 'red':
        return {
          bg: 'bg-red-500/10 border-red-500/25',
          text: 'text-red-400',
        };
      case 'navy':
      default:
        return {
          bg: 'bg-blue-500/10 border-blue-500/25',
          text: 'text-blue-400',
        };
    }
  };

  const styles = getColorStyles(trendColor);

  return (
    <div className={`glass-panel glow-card p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group flex items-center justify-between border border-white/5 bg-[#0F1E42]/10`}>
      {/* Dynamic Glow Corner Blob */}
      <div className={`absolute top-0 right-0 w-16 h-16 ${styles.bg} rounded-bl-full opacity-20 pointer-events-none group-hover:scale-115 transition-transform duration-500`} />
      
      <div className="space-y-2 z-10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">
          {label}
        </span>
        {loading ? (
          <Loader2 className="w-5 h-5 text-orange-burnt animate-spin" />
        ) : (
          <span className="font-display font-extrabold text-3xl block leading-none text-white">
            {value}
          </span>
        )}
      </div>

      <div className={`w-11 h-11 rounded-xl ${styles.bg} ${styles.text} flex items-center justify-center border border-white/5 shrink-0 group-hover:scale-108 transition-all z-10 shadow-md shadow-black/20`}>
        {icon}
      </div>
    </div>
  );
};

export default StatsCard;
