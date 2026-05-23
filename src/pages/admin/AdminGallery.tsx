import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Modal } from '../../components/admin/Modal';
import { ImageUploadBox } from '../../components/admin/ImageUploadBox';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Edit, 
  Loader2, 
  AlertCircle,
  Tag
} from 'lucide-react';

export const AdminGallery: React.FC = () => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Events' | 'Competitions' | 'Campus Life' | 'General'>('All');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [photoToEdit, setPhotoToEdit] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    category: 'Events',
  });

  const fetchPhotos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (err: any) {
      console.error('Error fetching gallery photos:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    if (activeTab === 'All') {
      setFilteredPhotos(photos);
    } else {
      setFilteredPhotos(photos.filter((p) => p.category.toLowerCase() === activeTab.toLowerCase()));
    }
  }, [photos, activeTab]);

  useEffect(() => {
    if (photoToEdit) {
      setFormData({
        title: photoToEdit.title || '',
        image_url: photoToEdit.image_url || '',
        category: photoToEdit.category || 'Events',
      });
    } else {
      setFormData({
        title: '',
        image_url: '',
        category: 'Events',
      });
    }
  }, [photoToEdit, isModalOpen]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this photo from the gallery? This is permanent.')) {
      return;
    }

    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
      fetchPhotos();
    } catch (err: any) {
      alert(`Error deleting photo: ${err.message}`);
    }
  };

  const handleEdit = (photo: any) => {
    setPhotoToEdit(photo);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setPhotoToEdit(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image_url) return;

    setIsSaving(true);
    try {
      const dataPayload = {
        title: formData.title,
        image_url: formData.image_url,
        category: formData.category,
      };

      if (photoToEdit) {
        // UPDATE record
        const { error } = await supabase
          .from('gallery')
          .update(dataPayload)
          .eq('id', photoToEdit.id);

        if (error) throw error;
      } else {
        // INSERT record
        const { error } = await supabase
          .from('gallery')
          .insert([dataPayload]);

        if (error) throw error;
      }

      fetchPhotos();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(`Error saving photo: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'competitions':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'campus life':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'general':
        return 'bg-navy-dark/10 text-navy-dark border-navy-dark/20';
      case 'events':
      default:
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header bar section */}
      <div className="flex items-center justify-between bg-white border border-navy-dark/10 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-orange-burnt/10 flex items-center justify-center text-orange-burnt">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-base text-navy-dark">Photo Gallery Console</h3>
            <p className="text-[10px] text-navy-dark/45 font-sans leading-none mt-0.5">
              Upload external image links to display in the student visual gallery feed.
            </p>
          </div>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-orange-burnt hover:bg-orange-burnt/95 text-white rounded-lg font-display text-xs font-bold shadow-md shadow-orange-burnt/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Photo</span>
        </button>
      </div>

      {/* Category Tabs Strip */}
      <div className="flex flex-wrap bg-white border border-navy-dark/10 p-2.5 rounded-xl gap-2 shadow-xs">
        {(['All', 'Events', 'Competitions', 'Campus Life', 'General'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-navy-dark text-white shadow-sm'
                  : 'text-navy-dark/65 hover:bg-gray-light hover:text-navy-dark'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Photo Cards Grid */}
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center text-navy-dark/45 bg-white border border-navy-dark/10 rounded-2xl">
          <Loader2 className="w-10 h-10 text-orange-burnt animate-spin mb-4" />
          <p className="font-display text-sm tracking-wider uppercase">Loading gallery records...</p>
        </div>
      ) : filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div 
              key={photo.id} 
              className="bg-white border border-navy-dark/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
            >
              {/* Cover Image */}
              <div className="h-48 bg-gray-100 overflow-hidden relative">
                <img
                  src={photo.image_url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
              </div>

              {/* Body details */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-widest ${getCategoryBadgeColor(photo.category)}`}>
                    <Tag className="w-2.5 h-2.5 shrink-0" />
                    <span>{photo.category}</span>
                  </span>
                  <h4 className="font-display font-extrabold text-sm text-navy-dark leading-snug">
                    {photo.title}
                  </h4>
                </div>

                {/* Operations CRUD Panel */}
                <div className="flex items-center gap-2 pt-2 border-t border-navy-dark/5">
                  <button
                    onClick={() => handleEdit(photo)}
                    className="flex-grow inline-flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg bg-navy-dark/5 text-navy-dark hover:bg-navy-dark hover:text-white text-xs font-semibold transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Photo</span>
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="p-1.5 rounded-lg text-navy-dark/45 hover:bg-red-50 hover:text-red-600 transition-colors border border-navy-dark/5"
                    title="Delete Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-white border border-navy-dark/10 rounded-2xl px-4">
          <AlertCircle className="w-12 h-12 text-navy-dark/15 mx-auto mb-4" />
          <h3 className="font-display font-extrabold text-base text-navy-dark uppercase tracking-wider">
            No Photos Found
          </h3>
          <p className="text-xs text-navy-dark/50 max-w-xs mx-auto mt-1.5 leading-relaxed font-sans">
            Ready to upload your first visual memory? Click the add button to upload an image URL.
          </p>
        </div>
      )}

      {/* modal uploader drawer */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={photoToEdit ? 'Edit Gallery Photo' : 'Add Photo to Gallery'}
        icon={<ImageIcon className="w-5 h-5" />}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy-dark/70 mb-1.5">
              Photo Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Sports Winners 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt outline-none text-sm bg-white transition-colors"
            />
          </div>

          {/* Category drop down */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy-dark/70 mb-1.5">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-navy-dark/15 focus:border-orange-burnt focus:ring-1 focus:ring-orange-burnt outline-none text-sm bg-white cursor-pointer"
            >
              <option>Events</option>
              <option>Competitions</option>
              <option>Campus Life</option>
              <option>General</option>
            </select>
          </div>

          {/* ImageUploadBox with typed preview capabilities */}
          <ImageUploadBox
            required
            value={formData.image_url}
            onChange={(val) => setFormData({ ...formData, image_url: val })}
          />

          {/* Action buttons */}
          <div className="flex space-x-3 pt-3 border-t border-navy-dark/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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
                  <span>Saving Image...</span>
                </>
              ) : (
                <span>Publish Image</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default AdminGallery;
