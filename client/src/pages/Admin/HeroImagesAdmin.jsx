import React, { useEffect, useState } from "react";
import bannerService from "../../services/bannerService";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import Modal from "../../components/admin/Modal";
import { Plus } from "lucide-react";

const HeroImagesAdmin = () => {
  const [banners, setBanners] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = async () => {
    setDataLoading(true);
    try {
      const list = await bannerService.getBanners();
      setBanners(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Failed to load banners", e);
      toast.error("Failed to load banners");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    setLoading(true);
    const loadingToast = toast.loading("Uploading banner...");
    try {
      await bannerService.uploadBanner({ file, title, category });
      setFile(null);
      setTitle("");
      setCategory("");
      toast.success("Banner uploaded successfully", { id: loadingToast });
      setIsModalOpen(false);
      await load();
    } catch (e) {
      console.error("Upload failed", e);
      toast.error(e?.response?.data?.message || "Failed to upload banner", {
        id: loadingToast,
      });
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    const loadingToast = toast.loading("Deleting banner...");
    try {
      await bannerService.deleteBanner(id);
      toast.success("Banner deleted successfully", { id: loadingToast });
      await load();
    } catch (e) {
      console.error("Delete banner failed", e);
      toast.error(e?.response?.data?.message || "Failed to delete banner", {
        id: loadingToast,
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Gallery Images
          </h1>
          <p className="text-neutral-500 mt-1">Manage website gallery images</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-pink-800 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Upload Image
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {dataLoading ? (
          <div className="p-12 flex justify-center">
            <Loader />
          </div>
        ) : banners.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            No images found. Upload one to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
            {banners.map((b) => (
              <div
                key={b._id}
                className="group relative bg-neutral-50 rounded-xl overflow-hidden border border-neutral-200 aspect-4/3"
              >
                <img
                  src={b.imageUrl}
                  alt={b.title || "banner"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <div className="text-white font-medium truncate">
                    {b.title || "Untitled"}
                  </div>
                  {b.category && (
                    <div className="text-white/80 text-xs truncate">
                      {b.category}
                    </div>
                  )}
                  <button
                    onClick={() => remove(b._id)}
                    className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white py-1.5 rounded text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Gallery Image"
      >
        <form onSubmit={add} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Image File
            </label>
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:bg-neutral-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="gallery-file-upload"
              />
              <label
                htmlFor="gallery-file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Plus size={28} />
                <span className="text-sm text-neutral-600">
                  {file ? file.name : "Click to upload image"}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Title (Optional)
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Collection"
              className="w-full border border-neutral-300 px-3 py-2 rounded-lg text-neutral-900 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Category (Optional)
            </label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Wedding"
              className="w-full border border-neutral-300 px-3 py-2 rounded-lg text-neutral-900 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              className="flex-1 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-60 font-medium shadow-sm"
              type="submit"
            >
              {loading ? "Uploading..." : "Upload Image"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HeroImagesAdmin;
