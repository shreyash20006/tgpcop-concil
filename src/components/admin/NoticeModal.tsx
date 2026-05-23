import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Loader2, Megaphone } from 'lucide-react';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  noticeToEdit?: any; // If supplied, we are editing
}

export const NoticeModal: React.FC<NoticeModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
  noticeToEdit,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    pdf_url: '',
    external_link: '',
    is_pinned: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (noticeToEdit) {
      setFormData({
        title: noticeToEdit.title || '',
        description: noticeToEdit.description || '',
        category: noticeToEdit.category || 'General',
        pdf_url: noticeToEdit.pdf_url || '',
        external_link: noticeToEdit.external_link || '',
        is_pinned: noticeToEdit.is_pinned || false,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'General',
        pdf_url: '',
        external_link: '',
        is_pinned: false,
      });
    }
  }, [noticeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    setIsSaving(true);
    try {
      if (noticeToEdit) {
        // UPDATE
        const { error } = await supabase
          .from('notices')
          .update({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            pdf_url: formData.pdf_url || null,
            external_link: formData.external_link || null,
            is_pinned: formData.is_pinned,
          })
          .eq('id', noticeToEdit.id);

        if (error) throw error;
      } else {
        // INSERT
        const { error } = await supabase.from('notices').insert([
          {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            pdf_url: formData.pdf_url || null,
            external_link: formData.external_link || null,
            is_pinned: formData.is_pinned,
          },
        ]);

        if (error) throw error;
      }

      onRefresh();
      onClose();
    } catch (err: any) {
      alert(`Error saving notice: ${err.message}`);
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
            <Megaphone className="w-5 h-5 text-orange-burnt" />
            <h3 className="font-display font-bold text-lg">
              {noticeToEdit ? 'Edit Notice' : 'Add New Notice'}
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
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy-dark/70 mb-1.5">
              Notice Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mid-Semester Exam Schedule"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-navy-dark/15 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt outline-none text-sm transition-colors"
            />
          </div>

          {/* Category dropdown & Pin toggle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-dark/70 mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt outline-none text-sm transition-colors"
              >
                <option>Academic</option>
                <option>Event</option>
                <option>Alert</option>
                <option>General</option>
              </select>
            </div>

            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center space-x-3.5 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                  className="rounded border-navy-dark/15 text-orange-burnt focus:ring-orange-burnt w-4 h-4"
                />
                <span className="text-xs font-bold uppercase tracking-wider text-navy-dark/70">Pin to Top</span>
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
              placeholder="Provide comprehensive details about the announcement..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-navy-dark/15 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt outline-none text-sm transition-colors resize-none"
            />
          </div>

          {/* PDF URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy-dark/70 mb-1.5">
              PDF Document Link (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. https://drive.google.com/exam-file.pdf"
              value={formData.pdf_url}
              onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-navy-dark/15 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt outline-none text-sm transition-colors"
            />
          </div>

          {/* External Link */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy-dark/70 mb-1.5">
              External Link (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. https://google-form-link"
              value={formData.external_link}
              onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
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
                <span>{noticeToEdit ? 'Save Changes' : 'Create Notice'}</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default NoticeModal;
