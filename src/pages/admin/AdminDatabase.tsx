import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { RequirePermission } from '../../components/admin/RequirePermission';
import { Database, Loader2, RefreshCw } from 'lucide-react';

const TABLES = [
  'questions',
  'notices',
  'events',
  'gallery',
  'settings',
  'admin_roles',
] as const;

type TableName = (typeof TABLES)[number];

export const AdminDatabase: React.FC = () => {
  const [counts, setCounts] = useState<Record<TableName, number | null>>(
    Object.fromEntries(TABLES.map((t) => [t, null])) as Record<TableName, number | null>
  );
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchCounts = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.all(
        TABLES.map(async (table) => {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          if (error) throw error;
          return { table, count: count ?? 0 };
        })
      );

      setCounts((prev) => {
        const next = { ...prev };
        results.forEach(({ table, count }) => {
          next[table] = count;
        });
        return next;
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch table counts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <RequirePermission permission="view_database">
      <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl">
        <div className="flex items-center justify-between bg-white border border-navy-dark/10 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-orange-burnt/10 flex items-center justify-center text-orange-burnt">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-navy-dark">
                🗄️ Database Viewer
              </h3>
              <p className="text-[10px] text-navy-dark/45 font-sans mt-0.5">
                Live row counts for all portal tables
              </p>
            </div>
          </div>
          <button
            onClick={fetchCounts}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-navy-dark/15 text-navy-dark text-xs font-bold hover:bg-navy-dark/5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {isLoading && !lastUpdated ? (
          <div className="flex items-center justify-center py-20 text-navy-dark/40">
            <Loader2 className="w-8 h-8 animate-spin text-orange-burnt mr-3" />
            <span className="font-display text-sm">Loading table stats...</span>
          </div>
        ) : (
          <div className="bg-white border border-navy-dark/10 rounded-2xl shadow-xs overflow-hidden">
            <ul className="divide-y divide-navy-dark/5">
              {TABLES.map((table) => (
                <li
                  key={table}
                  className="flex items-center justify-between px-6 py-4 hover:bg-navy-dark/[0.02] transition-colors"
                >
                  <span className="font-mono text-sm text-navy-dark font-semibold">
                    {table}
                  </span>
                  <span className="font-display font-extrabold text-lg text-orange-burnt tabular-nums">
                    {counts[table] !== null ? (
                      <>
                        {counts[table]}{' '}
                        <span className="text-[10px] font-bold text-navy-dark/40 uppercase tracking-wider">
                          rows
                        </span>
                      </>
                    ) : (
                      '—'
                    )}
                  </span>
                </li>
              ))}
            </ul>
            {lastUpdated && (
              <p className="text-[10px] text-navy-dark/40 text-center py-3 border-t border-navy-dark/5">
                Last updated {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
      </div>
    </RequirePermission>
  );
};

export default AdminDatabase;
