import React, { useEffect, useState, useRef } from "react";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../../services/eventService";
import { convertToJpeg } from "../../utils/heicConvert";
import toast from "react-hot-toast";
import Loader from "../shared/components/Loader";
import Modal from "../admin/components/Modal";
import {
  Plus, Trash2, UploadCloud, Edit2, X, Image as ImageIcon,
} from "lucide-react";

const GALLERY_SLOTS = 5;

const EMPTY_FORM = {
  category: "",
  name: "",
  cover: null,            // { type:'existing', url, publicId } | { type:'new', file, preview } | null
  startingPrice: "",
  shortDescription: "",
  whatsIncluded: [],
  includedInput: "",
  bookBefore: "",
  serviceLocation: "",
  duration: "",
  gallerySlots: [null, null, null, null, null],
};

const EventsAdmin = () => {
  const [events, setEvents] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const coverRef = useRef();
  const galleryRefs = [useRef(), useRef(), useRef(), useRef(), useRef()];

  const load = async () => {
    setDataLoading(true);
    try {
      const evs = await getEvents();
      setEvents(evs);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Form helpers ──────────────────────────────────────────────────────────────
  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleCoverSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const converted = await convertToJpeg(file);
    const preview = URL.createObjectURL(converted);
    setForm((f) => ({ ...f, cover: { type: "new", file: converted, preview } }));
  };

  const handleGallerySelect = async (e, idx) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const converted = await convertToJpeg(file);
    const preview = URL.createObjectURL(converted);
    setForm((f) => {
      const slots = [...f.gallerySlots];
      slots[idx] = { type: "new", file: converted, preview };
      return { ...f, gallerySlots: slots };
    });
  };

  const removeGallerySlot = (idx) => {
    setForm((f) => {
      const slots = [...f.gallerySlots];
      slots[idx] = null;
      return { ...f, gallerySlots: slots };
    });
  };

  const addIncluded = (value) => {
    const trimmed = (value || form.includedInput).trim();
    if (!trimmed) return;
    if (form.whatsIncluded.includes(trimmed)) { toast.error("Already added"); return; }
    setForm((f) => ({ ...f, whatsIncluded: [...f.whatsIncluded, trimmed], includedInput: "" }));
  };

  const removeIncluded = (i) =>
    setForm((f) => ({ ...f, whatsIncluded: f.whatsIncluded.filter((_, idx) => idx !== i) }));

  // ── Open / close modal ────────────────────────────────────────────────────────
  const openAdd = () => {
    setIsEditMode(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (ev) => {
    const slots = [null, null, null, null, null];
    (ev.gallery || []).slice(0, GALLERY_SLOTS).forEach((img, i) => {
      slots[i] = { type: "existing", url: img.url, publicId: img.publicId };
    });
    setForm({
      category: ev.category || "",
      name: ev.name || "",
      cover: ev.coverImage?.url
        ? { type: "existing", url: ev.coverImage.url, publicId: ev.coverImage.publicId }
        : null,
      startingPrice: ev.startingPrice ?? "",
      shortDescription: ev.shortDescription || "",
      whatsIncluded: ev.whatsIncluded || [],
      includedInput: "",
      bookBefore: ev.bookBefore || "",
      serviceLocation: ev.serviceLocation || "",
      duration: ev.duration || "",
      gallerySlots: slots,
    });
    setEditingId(ev._id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Event name is required"); return; }
    if (!form.cover) { toast.error("Cover image is required"); return; }

    setLoading(true);
    const tid = toast.loading(isEditMode ? "Updating event..." : "Creating event...");

    try {
      // Cover: only send a file if a new one was picked
      const coverImageFile = form.cover?.type === "new" ? form.cover.file : undefined;

      const payload = {
        category: form.category.trim(),
        name: form.name.trim(),
        coverImageFile,
        startingPrice: form.startingPrice,
        shortDescription: form.shortDescription.trim(),
        whatsIncluded: form.whatsIncluded,
        bookBefore: form.bookBefore.trim(),
        serviceLocation: form.serviceLocation.trim(),
        duration: form.duration.trim(),
        gallerySlots: form.gallerySlots,
      };

      if (isEditMode) {
        await updateEvent(editingId, payload);
        toast.success("Event updated", { id: tid });
      } else {
        await createEvent(payload);
        toast.success("Event created", { id: tid });
      }

      closeModal();
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    const tid = toast.loading("Deleting...");
    try {
      await deleteEvent(id);
      toast.success("Deleted", { id: tid });
      await load();
    } catch {
      toast.error("Failed to delete", { id: tid });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <p className="text-neutral-500 mt-1">Manage events shown under the Events tab</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg
          flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Add Event
        </button>
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        {dataLoading ? (
          <div className="p-12 flex justify-center"><Loader /></div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            No events found. Add one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-xs uppercase text-neutral-500 font-semibold tracking-wider">
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Starting Price</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map((ev) => (
                  <tr key={ev._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
                          {ev.coverImage?.url ? (
                            <img src={ev.coverImage.url} alt={ev.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-500">
                              <ImageIcon size={18} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{ev.name}</p>
                          {ev.duration && <p className="text-xs text-neutral-500">{ev.duration}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">{ev.category || "—"}</td>
                    <td className="px-6 py-4 text-violet-300 text-sm">
                      {ev.startingPrice ? `₹${ev.startingPrice.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-400">{ev.serviceLocation || "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(ev)}
                          className="p-2 text-neutral-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(ev._id)}
                          className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditMode ? "Edit Event" : "Add Event"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Event Name *</label>
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Mehandi"
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Event Category <span className="text-neutral-600">(optional)</span>
              </label>
              <input
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                placeholder="e.g. Wedding"
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-2">Cover Image *</label>
            <div className="relative w-full h-40 rounded-lg overflow-hidden border border-white/10 bg-white/5">
              {form.cover ? (
                <>
                  <img
                    src={form.cover.type === "existing" ? form.cover.url : form.cover.preview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setField("cover", null)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-white/5 transition-colors gap-1.5">
                  <UploadCloud size={24} className="text-neutral-500" />
                  <span className="text-xs text-neutral-500">Click to upload cover image</span>
                  <input
                    ref={coverRef}
                    type="file"
                    accept="image/*,.heic,.heif"
                    className="hidden"
                    onChange={handleCoverSelect}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Starting Price + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Starting Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  value={form.startingPrice}
                  onChange={(e) => setField("startingPrice", e.target.value)}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 text-white pl-7 pr-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Duration</label>
              <input
                value={form.duration}
                onChange={(e) => setField("duration", e.target.value)}
                placeholder="e.g. 4 Hours / Full Day"
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Book Before + Service Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Book Before</label>
              <input
                value={form.bookBefore}
                onChange={(e) => setField("bookBefore", e.target.value)}
                placeholder="e.g. 5 days in advance"
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Service Location</label>
              <input
                value={form.serviceLocation}
                onChange={(e) => setField("serviceLocation", e.target.value)}
                placeholder="e.g. Mysuru / Bangalore"
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Short Description</label>
            <textarea
              value={form.shortDescription}
              onChange={(e) => setField("shortDescription", e.target.value)}
              placeholder="Brief one-liner about this event…"
              rows={2}
              className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>

          {/* What's Included */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-2">
              What's Included <span className="text-neutral-600">(bullet points)</span>
            </label>
            <div className="flex gap-2">
              <input
                value={form.includedInput}
                onChange={(e) => setField("includedInput", e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addIncluded(); } }}
                placeholder="e.g. Professional mehandi artist"
                className="flex-1 bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                type="button"
                onClick={() => addIncluded()}
                className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            {form.whatsIncluded.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.whatsIncluded.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  >
                    {item}
                    <button type="button" onClick={() => removeIncluded(i)} className="hover:text-white">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Gallery (up to 5) */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-2">
              Gallery Images <span className="text-neutral-600">(optional, up to {GALLERY_SLOTS})</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {form.gallerySlots.map((slot, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-white/5">
                  {slot ? (
                    <>
                      <img
                        src={slot.type === "existing" ? slot.url : slot.preview}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGallerySlot(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-white/5 transition-colors gap-1">
                      <UploadCloud size={16} className="text-neutral-500" />
                      <span className="text-[10px] text-neutral-600">Upload</span>
                      <input
                        ref={galleryRefs[idx]}
                        type="file"
                        accept="image/*,.heic,.heif"
                        className="hidden"
                        onChange={(e) => handleGallerySelect(e, idx)}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-4 py-2 border border-white/10 text-neutral-300 rounded-lg hover:bg-white/5 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="flex-1 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-60 font-medium"
            >
              {loading
                ? isEditMode ? "Updating…" : "Creating…"
                : isEditMode ? "Update Event" : "Add Event"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EventsAdmin;
