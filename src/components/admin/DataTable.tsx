import React from 'react';
import { Search, Loader2 } from 'lucide-react';

interface HeaderColumn {
  key: string;
  label: string;
  className?: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface DataTableProps {
  headers: HeaderColumn[];
  data: any[];
  isLoading: boolean;
  emptyState: {
    icon: React.ReactNode;
    title: string;
    description: string;
  };
  
  // Searching
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  // Filtering
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];

  // Secondary Filter (optional, e.g. directed_to)
  secondaryFilterValue?: string;
  onSecondaryFilterChange?: (value: string) => void;
  secondaryFilterOptions?: FilterOption[];

  // Row Renders
  renderRowDesktop: (item: any) => React.ReactNode;
  renderCardMobile: (item: any) => React.ReactNode;
}

export const DataTable: React.FC<DataTableProps> = ({
  headers,
  data,
  isLoading,
  emptyState,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterValue,
  onFilterChange,
  filterOptions,
  secondaryFilterValue,
  onSecondaryFilterChange,
  secondaryFilterOptions,
  renderRowDesktop,
  renderCardMobile,
}) => {
  const showFiltersStrip = onSearchChange || onFilterChange || onSecondaryFilterChange;

  return (
    <div className="space-y-6">
      
      {/* 1. FILTER & SEARCH CONTROL STRIP */}
      {showFiltersStrip && (
        <div className="bg-white border border-navy-dark/10 p-4 rounded-xl shadow-xs flex flex-col md:flex-row items-center gap-4">
          
          {/* Search Input Box */}
          {onSearchChange && (
            <div className="relative w-full md:flex-grow">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-navy-dark/30">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-navy-dark/15 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt outline-none text-sm bg-gray-50/50 transition-colors"
              />
            </div>
          )}

          {/* Filters Row Container */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Primary Dropdown Filter */}
            {onFilterChange && filterOptions && (
              <select
                value={filterValue}
                onChange={(e) => onFilterChange(e.target.value)}
                className="w-full sm:w-44 px-3 py-2 rounded-lg border border-navy-dark/15 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt outline-none text-xs font-semibold uppercase tracking-wider text-navy-dark/80 bg-white cursor-pointer"
              >
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {/* Secondary Dropdown Filter */}
            {onSecondaryFilterChange && secondaryFilterOptions && (
              <select
                value={secondaryFilterValue}
                onChange={(e) => onSecondaryFilterChange(e.target.value)}
                className="w-full sm:w-52 px-3 py-2 rounded-lg border border-navy-dark/15 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt outline-none text-xs font-semibold uppercase tracking-wider text-navy-dark/80 bg-white cursor-pointer"
              >
                {secondaryFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>

        </div>
      )}

      {/* 2. MAIN DATA RENDER Container */}
      <div className="bg-white border border-navy-dark/10 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-navy-dark/45 bg-white">
            <Loader2 className="w-10 h-10 text-orange-burnt animate-spin mb-4" />
            <p className="font-display text-sm tracking-wider uppercase">Loading database contents...</p>
          </div>
        ) : data.length > 0 ? (
          <>
            {/* DESKTOP TABLE VIEW (Visible on md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-navy-dark text-white border-b border-navy-dark/15">
                    {headers.map((head) => (
                      <th
                        key={head.key}
                        className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/60 ${head.className || ''}`}
                      >
                        {head.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-dark/5 bg-white">
                  {data.map((item) => renderRowDesktop(item))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS VIEW (Visible on <md) */}
            <div className="md:hidden divide-y divide-navy-dark/5 bg-white">
              {data.map((item) => renderCardMobile(item))}
            </div>
          </>
        ) : (
          /* EMPTY STATE VIEW */
          <div className="text-center py-20 bg-white px-4">
            <div className="text-navy-dark/15 mx-auto mb-4 w-12 h-12 flex items-center justify-center">
              {emptyState.icon}
            </div>
            <h3 className="font-display font-extrabold text-base text-navy-dark uppercase tracking-wider">
              {emptyState.title}
            </h3>
            <p className="text-xs text-navy-dark/50 max-w-xs mx-auto mt-1.5 leading-relaxed font-sans">
              {emptyState.description}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default DataTable;
