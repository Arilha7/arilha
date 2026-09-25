'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Eye, EyeOff, MoveUp, MoveDown, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import { cmsService, LifestyleSlide } from '@/services/cmsService';

export default function AdminLifestyleSlidesPage() {
  const [slides, setSlides] = useState<LifestyleSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<LifestyleSlide | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<LifestyleSlide>>({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    sort_order: 1,
    is_active: 1,
  });

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await cmsService.getLifestyleSlides();
      if (res.success && Array.isArray(res.data)) {
        setSlides(res.data.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
      }
    } catch (err) {
      console.error('Failed to fetch lifestyle slides', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleOpenAdd = () => {
    setEditingSlide(null);
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '',
      sort_order: slides.length + 1,
      is_active: 1,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (slide: LifestyleSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || '',
      image_url: slide.image_url,
      link_url: slide.link_url || '',
      sort_order: slide.sort_order || 1,
      is_active: Number(slide.is_active),
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this carousel slide?')) return;
    try {
      await cmsService.deleteLifestyleSlide(id);
      fetchSlides();
    } catch (err) {
      alert('Failed to delete slide');
    }
  };

  const handleToggleActive = async (slide: LifestyleSlide) => {
    if (!slide.id) return;
    try {
      const newStatus = Number(slide.is_active) === 1 ? 0 : 1;
      await cmsService.updateLifestyleSlide(slide.id, { is_active: newStatus });
      fetchSlides();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image_url) {
      alert('Title and Image URL are required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingSlide && editingSlide.id) {
        await cmsService.updateLifestyleSlide(editingSlide.id, formData);
      } else {
        await cmsService.createLifestyleSlide(formData);
      }
      setModalOpen(false);
      fetchSlides();
    } catch (err) {
      alert('Failed to save slide');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 font-serif">Homepage → Lifestyle / Category Carousel</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage 3D overlapping category slides displayed on the storefront homepage under Anti-Tarnish Jewellery.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Carousel Slide</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
          <ImageIcon className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-800">No slides added yet</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Click "Add Carousel Slide" to configure category slides for the storefront 3D carousel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className={`relative bg-white rounded-2xl border transition-all overflow-hidden shadow-xs ${
                Number(slide.is_active) === 1 ? 'border-neutral-200' : 'border-neutral-200 opacity-60 bg-neutral-50'
              }`}
            >
              <div className="relative h-48 bg-neutral-100">
                <Image
                  src={slide.image_url}
                  alt={slide.title}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-3 left-3 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Order #{slide.sort_order}
                </span>
                <button
                  onClick={() => handleToggleActive(slide)}
                  className={`absolute top-3 right-3 p-1.5 rounded-full shadow-md text-xs transition-colors ${
                    Number(slide.is_active) === 1 ? 'bg-emerald-500 text-white' : 'bg-neutral-600 text-white'
                  }`}
                  title={Number(slide.is_active) === 1 ? 'Active (Click to disable)' : 'Disabled (Click to enable)'}
                >
                  {Number(slide.is_active) === 1 ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="font-bold text-neutral-900 text-base">{slide.title}</h3>
                {slide.subtitle && <p className="text-xs text-neutral-500 line-clamp-1">{slide.subtitle}</p>}
                {slide.link_url && (
                  <div className="flex items-center text-xs text-neutral-400 space-x-1 pt-1">
                    <LinkIcon className="w-3 h-3 text-neutral-400 shrink-0" />
                    <span className="truncate">{slide.link_url}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    Number(slide.is_active) === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {Number(slide.is_active) === 1 ? 'Active' : 'Disabled'}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(slide)}
                      className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Edit slide"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => slide.id && handleDelete(slide.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit Slide */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold font-serif text-neutral-900 border-b pb-3">
              {editingSlide ? 'Edit Carousel Slide' : 'Add New Carousel Slide'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Title (e.g. DAILY WEAR) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="OFFICE WEAR"
                  className="w-full text-sm border border-neutral-300 rounded-xl p-2.5 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Anti-tarnish minimalist chains & hoops"
                  className="w-full text-sm border border-neutral-300 rounded-xl p-2.5 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full text-sm border border-neutral-300 rounded-xl p-2.5 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Destination Link URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.link_url || ''}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="/collections/chains"
                  className="w-full text-sm border border-neutral-300 rounded-xl p-2.5 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.sort_order || 1}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                    className="w-full text-sm border border-neutral-300 rounded-xl p-2.5 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formData.is_active ? 1 : 0}
                    onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}
                    className="w-full text-sm border border-neutral-300 rounded-xl p-2.5 focus:ring-2 focus:ring-neutral-900 focus:outline-none bg-white"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Disabled</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Slide</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
