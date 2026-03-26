import React, { useEffect, useState } from "react";
import bannerService from "../../services/bannerService";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import Modal from "../../components/admin/Modal";
import { Plus, Trash2 } from "lucide-react";

const BannerImagesAdmin = () => {
  const [banners, setBanners] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = async () => {
    setDataLoading(true);
    try {
      const list = await bannerService.getBanners('hero');
      setBanners(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Failed to load hero banners", e);
      toast.error("Failed to load banner images");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!file) { toast.error("Please select a file"); return; }
    setLoading(true);
    const tid = toast.loading("Uploading banner...");
    try {
      await bannerService.uploadBanner({ file, title, type: 'hero' });
      setFile(null);
      setTitle("");
      toast.success("Banner uploaded successfully", { id: tid });
      setIsModalOpen(false);
      await load();
    } catch (e) {
      console.error("Upload failed", e);
      toast.error(e?.response?.data?.message || "Failed to upload banner", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this banner image?")) return;
    const tid = toast.loading("Deleting...");
    try {
      await bannerService.deleteBanner(id);
      toast.success("Banner deleted", { id: tid });
      await load();
    } catch (e) {
      console.error("Delete failed", e);
      toast.error(e?.response?.data?.message || "Failed to delete banner", { id: tid });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Banner Images</h1>
          <p className="text-neutral-500 mt-1">
            Manage homepage hero slider images — upload as many as you like, all will appear in the banner
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Upload Banner
        </button>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {dataLoading ? (
          <div className="p-12 flex justify-center"><Loader /></div>
        ) : banners.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            No banner images yet. Upload one to replace the homepage hero slider.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-6">
            {banners.map((b, idx) => (
              <div
                key={b._id}
                className="relative bg-white/5 rounded-xl overflow-hidden border border-white/10 aspect-video"
              >
                <img
                  src={b.imageUrl}
                  alt={b.title || `Banner ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Always-visible overlay strip at bottom */}
                <div className="absolute bottom-0 inset-x-0 bg-black/60 px-3 py-2 flex items-center justify-between gap-2">
                  <span className="text-white text-xs truncate">
                    {b.title || `Slide ${idx + 1}`}
                  </span>
                  <button
                    onClick={() => remove(b._id)}
                    className="shrink-0 p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Banner Image">
        <form onSubmit={add} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Image File</label>
            <div className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center hover:bg-white/5 transition-colors">
              <input
                type="file"
                accept="image/*"
                id="banner-file-upload"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) { setFile(null); return; }
                  if (f.size > 5 * 1024 * 1024) {
                    toast.error("File too large. Max size is 5 MB.");
                    e.target.value = null;
                    setFile(null);
                  } else {
                    setFile(f);
                  }
                }}
              />
              <label htmlFor="banner-file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Plus size={28} className="text-neutral-400" />
                <span className="text-sm text-neutral-400">{file ? file.name : "Click to upload image"}</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Title (Optional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wedding Collection"
              className="w-full border border-white/10 bg-white/5 px-3 py-2 rounded-lg text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-white/10 text-neutral-300 rounded-lg hover:bg-white/5 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              className="flex-1 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-60 font-medium"
              type="submit"
            >
              {loading ? "Uploading..." : "Upload Banner"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BannerImagesAdmin;

