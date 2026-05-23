import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Loader2, Calendar } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  eventToEdit?: any; // If supplied, we are editing
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
  eventToEdit,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'event',
    deadline: '',
    prize_info: '',
    google_form_link: '',
    is_active: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        name: eventToEdit.name || '',
        description: eventToEdit.description || '',
        type: eventToEdit.type || 'event',
        deadline: eventToEdit.deadline || '',
        prize_info: eventToEdit.prize_info || '',
        google_form_link: eventToEdit.google_form_link || '',
        is_active: eventToEdit.is_active ?? true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'event',
        deadline: '',
        prize_info: '',
        google_form_link: '',
        is_active: true,
      });
    }
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) return;

    setIsSaving(true);
    try {
      const dataPayload = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        deadline: formData.deadline || null,
        prize_info: formData.prize_info || null,
        google_form_link: formData.google_form_link || null,
        is_active: formData.is_active,
      };

      if (eventToEdit) {
        // UPDATE
        const { error } = await supabase
          .from('events')
          .update(dataPayload)
          .eq('id', eventToEdit.id);

        if (error) throw error;
      } else {
        // INSERT
        const { error } = await supabase.from('events').insert([dataPayload]);

        if (error) throw error;
      }

      onRefresh();
      onClose();
    } catch (err: any) {
      alert(`Error saving event: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-navy-dark/10 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-navy-dark text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Calendar className="w-5 h-5 text-orange-burnt" />
            <h3 className="font-display font-bold text-lg">
              {eventToEdit ? 'Edit Event / Competition' : 'Add New Event / Competition'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy-dark/70 mb-1.5">
              Event / Competition Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Pharma Quiz 2026"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-navy-dark/15 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt outline-none text-sm transition-colors"
            />
          </div>

          {/* Type dropdown & Active Toggle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-dark/70 mb-1.5">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt outline-none text-sm transition-colors"
              >
                <option value="event">Event (Timeline)</option>
                <option value="competition">Competition (Card)</option>
              </select>
            </div>

            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center space-x-3.5 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-navy-dark/15 text-orange-burnt focus:ring-orange-burnt w-4 h-4"
                />
                <span className="text-xs font-bold uppercase tracking-wider text-navy-dark/70">Is Active</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy-dark/70 mb-1.5">
              Description *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide comprehensive details about the occurrence..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-navy-dark/15 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt outline-none text-sm transition-colors resize-none"
            />
          </div>

          {/* Deadline / Date Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy-dark/70 mb-1.5">
              Target Deadline / Date {formData.type === 'competition' ? '*' : '(Optional)'}
            </label>
            <input
              type="date"
              required={formData.type === 'competition'}
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-navy-dark/15 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt outline-none text-sm transition-colors"
            />
          </div>

          {/* Prize Info */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy-dark/70 mb-1.5">
              Prize / Reward Details (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Cash prizes up to ₹5,000 + trophies"
              value={formData.prize_info}
              onChange={(e) => setFormData({ ...formData, prize_info: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-navy-dark/15 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt outline-none text-sm transition-colors"
            />
          </div>

          {/* Google Form Link */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy-dark/70 mb-1.5">
              Google Form Link (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. https://forms.gle/XYZ"
              value={formData.google_form_link}
              onChange={(e) => setFormData({ ...formData, google_form_link: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-navy-dark/15 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt outline-none text-sm transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-3 border-t border-navy-dark/5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-navy-dark/15 hover:bg-navy-dark/5 text-navy-dark font-display text-sm font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 bg-orange-burnt hover:bg-orange-burnt/95 text-white font-display text-sm font-semibold rounded-lg shadow-md transition-all flex items-center justify-center space-x-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{eventToEdit ? 'Save Changes' : 'Create Event'}</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default EventModal;
