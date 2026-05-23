import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DataTable } from '../../components/admin/DataTable';
import { EventModal } from '../../components/admin/EventModal';
import { 
  Plus, 
  Trash2, 
  Edit, 
  CalendarDays, 
  Award, 
  ExternalLink,
  AlertCircle 
} from 'lucide-react';

/* ========================================================
 * MOBILE CARD COMPONENT FOR EVENTS
 * ======================================================== */
const EventCardMobile: React.FC<{ 
  eventItem: any; 
  onEdit: (e: any) => void; 
  onDelete: (id: string) => void;
}> = ({ eventItem, onEdit, onDelete }) => {
  const getTypeBadgeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'competition':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'event':
      default:
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    }
  };

  const formattedDate = eventItem.deadline 
    ? new Date(eventItem.deadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No Date Target';

  return (
    <div className="p-5 space-y-3 hover:bg-navy-dark/[0.01] transition-colors relative">
      {/* Category type + Active status strip */}
      <div className="flex items-center justify-between">
        <span className={`inline-block text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${getTypeBadgeColor(eventItem.type)}`}>
          {eventItem.type === 'competition' ? 'Contest' : 'Event'}
        </span>
        {eventItem.is_active ? (
          <span className="inline-flex items-center px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] font-extrabold tracking-wider uppercase rounded-full">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 bg-navy-dark/10 text-navy-dark/45 border border-navy-dark/15 text-[9px] font-extrabold tracking-wider uppercase rounded-full">
            Disabled
          </span>
        )}
      </div>

      {/* Title Details */}
      <div className="space-y-1">
        <h4 className="font-display font-extrabold text-sm text-navy-dark leading-snug">
          {eventItem.name}
        </h4>
        <p className="text-xs text-navy-dark/60 font-sans leading-relaxed">
          {eventItem.description}
        </p>
      </div>

      {/* Date & Extras */}
      <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-navy-dark/70">
        <div className="flex items-center space-x-1.5 text-[10px] text-navy-dark/45 font-medium">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>

        {/* Prizes & forms link */}
        <div className="flex flex-col items-end space-y-1">
          {eventItem.prize_info && (
            <div className="flex items-center space-x-0.5 text-[10px] text-amber-600 font-bold">
              <Award className="w-3 h-3" />
              <span>{eventItem.prize_info}</span>
            </div>
          )}
          {eventItem.google_form_link && (
            <a 
              href={eventItem.google_form_link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center space-x-0.5 text-[9px] text-orange-burnt hover:underline font-extrabold uppercase tracking-wide"
            >
              <span>Forms</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </div>

      {/* Card CRUD controls */}
      <div className="flex items-center gap-2 pt-2 border-t border-navy-dark/5">
        <button
          onClick={() => onEdit(eventItem)}
          className="flex-grow inline-flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg bg-navy-dark/5 text-navy-dark hover:bg-navy-dark hover:text-white text-xs font-semibold transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Edit Details</span>
        </button>
        <button
          onClick={() => onDelete(eventItem.id)}
          className="p-1.5 rounded-lg text-navy-dark/45 hover:bg-red-50 hover:text-red-600 transition-colors border border-navy-dark/5"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeTab, setTypeTab] = useState<'All' | 'event' | 'competition'>('All');
  const [isLoading, setIsLoading] = useState(true);

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      console.error('Error fetching events:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    let result = [...events];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query)
      );
    }

    if (typeTab !== 'All') {
      result = result.filter((e) => e.type.toLowerCase() === typeTab.toLowerCase());
    }

    setFilteredEvents(result);
  }, [events, searchQuery, typeTab]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this event/contest? Cannot undo.')) return;

    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      fetchEvents();
    } catch (err: any) {
      alert(`Error deleting event: ${err.message}`);
    }
  };

  const handleEdit = (eventItem: any) => {
    setEventToEdit(eventItem);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEventToEdit(null);
    setIsModalOpen(true);
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'competition':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'event':
      default:
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    }
  };

  const headers = [
    { key: 'status', label: 'Status', className: 'w-24' },
    { key: 'name', label: 'Details' },
    { key: 'type', label: 'Type', className: 'w-32' },
    { key: 'deadline', label: 'Target Date', className: 'w-44' },
    { key: 'extras', label: 'Prizes & Forms', className: 'w-52' },
    { key: 'actions', label: 'Actions', className: 'text-right w-44' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Dynamic Tab Filter Bar & Add Buttons */}
      <div className="bg-white border border-navy-dark/10 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Visual filter tabs as requested */}
        <div className="flex bg-gray-light p-1 rounded-xl w-full sm:w-auto">
          {(['All', 'event', 'competition'] as const).map((tab) => {
            const label = tab === 'All' ? 'All Operations' : tab === 'event' ? 'Timeline Events' : 'Competitions';
            const isActive = typeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setTypeTab(tab)}
                className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-burnt text-white shadow-sm'
                    : 'text-navy-dark/60 hover:text-navy-dark'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4.5 py-2.5 bg-orange-burnt hover:bg-orange-burnt/95 text-white rounded-lg font-display text-xs font-bold shadow-md shadow-orange-burnt/20 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      {/* Events DataTable list */}
      <DataTable
        headers={headers}
        data={filteredEvents}
        isLoading={isLoading}
        emptyState={{
          icon: <AlertCircle className="w-12 h-12 text-navy-dark/15" />,
          title: 'No Events Found',
          description: 'Ready to launch your first event or student contest card? Click the add button to publish now.'
        }}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search events/competitions by title keywords or summaries..."
        renderRowDesktop={(item) => {
          const formattedDate = item.deadline 
            ? new Date(item.deadline).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'No Target Set';

          return (
            <tr key={item.id} className="hover:bg-navy-dark/[0.01] transition-colors">
              {/* Active Badge cell */}
              <td className="px-6 py-4 whitespace-nowrap">
                {item.is_active ? (
                  <span className="inline-flex items-center px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] font-extrabold tracking-wider uppercase rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 bg-navy-dark/10 text-navy-dark/45 border border-navy-dark/15 text-[9px] font-extrabold tracking-wider uppercase rounded-full">
                    Disabled
                  </span>
                )}
              </td>

              {/* Name Details */}
              <td className="px-6 py-4">
                <div className="space-y-1 max-w-xs">
                  <span className="font-display font-bold text-sm text-navy-dark block leading-snug">
                    {item.name}
                  </span>
                  <p className="text-xs text-navy-dark/60 font-sans line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </td>

              {/* Type Badge */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${getTypeBadgeColor(item.type)}`}>
                  {item.type === 'competition' ? 'Contest' : 'Event'}
                </span>
              </td>

              {/* Target Date */}
              <td className="px-6 py-4 whitespace-nowrap text-xs text-navy-dark/55">
                <div className="flex items-center space-x-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>{formattedDate}</span>
                </div>
              </td>

              {/* Prizes and Forms Link */}
              <td className="px-6 py-4 whitespace-nowrap text-xs text-navy-dark/70">
                <div className="space-y-1 max-w-[180px] truncate">
                  {item.prize_info && (
                    <div className="flex items-center space-x-1 text-[11px] font-bold text-amber-600 leading-none">
                      <Award className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.prize_info}</span>
                    </div>
                  )}
                  {item.google_form_link && (
                    <a 
                      href={item.google_form_link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center space-x-0.5 text-[10px] font-bold text-orange-burnt hover:underline"
                    >
                      <span>Form Link</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {!item.prize_info && !item.google_form_link && (
                    <span className="text-[10px] text-navy-dark/30 font-medium">None</span>
                  )}
                </div>
              </td>

              {/* Action column */}
              <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="inline-flex items-center space-x-1 py-1.5 px-3 rounded-lg bg-navy-dark/5 text-navy-dark hover:bg-navy-dark hover:text-white transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="inline-flex items-center p-1.5 rounded-lg text-navy-dark/40 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          );
        }}
        renderCardMobile={(item) => (
          <EventCardMobile
            key={item.id}
            eventItem={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      />

      {/* Modal publisher */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchEvents}
        eventToEdit={eventToEdit}
      />

    </div>
  );
};

export default AdminEvents;
