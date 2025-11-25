import React, { useEffect, useState } from "react";
import instaService from "../../services/instaService";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import Modal from "../../components/admin/Modal";
import { Plus } from "lucide-react";

const InstaAdmin = () => {
  const [posts, setPosts] = useState([]);
  const [postUrl, setPostUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await instaService.getPosts();
      setPosts(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Failed to load posts", e);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    const url = postUrl.trim();
    if (!url) {
      toast.error("Please enter a valid URL");
      return;
    }
    const loadingToast = toast.loading("Adding post...");
    try {
      await instaService.addPost({ postUrl: url, caption });
      setPostUrl("");
      setCaption("");
      toast.success("Post added successfully", { id: loadingToast });
      setIsModalOpen(false);
      await load();
    } catch (e) {
      console.error("Add post failed", e);
      toast.error(e?.response?.data?.message || "Failed to add post", {
        id: loadingToast,
      });
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    const loadingToast = toast.loading("Deleting post...");
    try {
      await instaService.deletePost(id);
      toast.success("Post deleted successfully", { id: loadingToast });
      await load();
    } catch (e) {
      console.error("Delete post failed", e);
      toast.error(e?.response?.data?.message || "Failed to delete post", {
        id: loadingToast,
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Instagram Posts
          </h1>
          <p className="text-neutral-500 mt-1">Manage social media feed</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-pink-800 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Post
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader />
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            No posts found. Add one to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-6">
            {posts.map((p) => (
              <div
                key={p._id}
                className="group relative bg-neutral-50 rounded-xl overflow-hidden border border-neutral-200 p-5 "
              >
                <p className="text-blue-600 "> {p.postUrl}</p>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <div className="text-white font-medium truncate">
                    {p.caption || "(no caption)"}
                  </div>
                  <a
                    href={p.postUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white/80 text-xs truncate hover:underline"
                  >
                    View Original
                  </a>
                  <button
                    onClick={() => remove(p._id)}
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
        title="Add Instagram Post"
      >
        <form onSubmit={add} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              className="w-full border border-neutral-300 px-3 py-2 rounded-lg text-neutral-900 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
              placeholder="https://..."
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Caption (Optional)
            </label>
            <input
              className="w-full border border-neutral-300 px-3 py-2 rounded-lg text-neutral-900 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
              placeholder="e.g. New Arrival"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
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
              onClick={add}
              className="flex-1 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors font-medium shadow-sm"
            >
              Add Link
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InstaAdmin;
