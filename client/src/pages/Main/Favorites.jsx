import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getFavorites, removeFavorite } from "../../services/favoriteService";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import Footer from "../../components/Footer";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { firebaseUser, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!firebaseUser) {
      toast.error("Please login to view favorites");
      navigate("/login");
      return;
    }
    if (role !== "customer") {
      toast.error("Only customers can have favorites");
      navigate("/");
      return;
    }

    loadFavorites();
  }, [authLoading, firebaseUser, role, navigate]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error("[Favorites] Load error:", error);
      toast.error("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId, productTitle) => {
    const tid = toast.loading("Removing from favorites...");
    try {
      await removeFavorite(productId);
      setFavorites((prev) =>
        prev.filter((fav) => fav.product._id !== productId),
      );
      toast.success(`Removed "${productTitle}" from favorites`, { id: tid });
    } catch (error) {
      console.error("[Favorites] Remove error:", error);
      toast.error("Failed to remove from favorites", { id: tid });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="text-violet-400" size={32} fill="currentColor" />
            <h1 className="text-4xl md:text-5xl font-bold display-font text-white">
              My Favorites
            </h1>
          </div>
          <p className="text-neutral-500 text-sm">
            {favorites.length > 0
              ? `You have ${favorites.length} favorite ${favorites.length === 1 ? "item" : "items"}`
              : "No favorites yet"}
          </p>
        </motion.div>

        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <div className="glass rounded-3xl p-12 max-w-md mx-auto">
              <Heart className="mx-auto text-neutral-600 mb-4" size={64} />
              <h2 className="text-2xl font-bold text-white mb-2">
                No Favorites Yet
              </h2>
              <p className="text-neutral-500 text-sm mb-6">
                Start adding products to your favorites to see them here
              </p>
              <Link
                to="/products"
                className="inline-block px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-all"
              >
                Browse Products
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {favorites.map((fav, index) => {
              const product = fav.product;
              if (!product) return null;

              const mainImage =
                product.images?.[0]?.url ||
                product.images?.[0] ||
                product.image ||
                "";
              const price = product.price || "N/A";
              const category = product.category?.name || "Uncategorized";

              return (
                <motion.div
                  key={fav._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="glass rounded-2xl overflow-hidden group hover:border-violet-500/30 transition-all duration-300"
                >
                  <Link to={`/product/${product._id}`} className="block">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={mainImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </Link>

                  <div className="p-4">
                    <p className="text-xs text-violet-400 mb-1">{category}</p>
                    <Link to={`/product/${product._id}`}>
                      <h3 className="text-lg font-semibold text-white line-clamp-1 hover:text-violet-400 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-neutral-400 line-clamp-2 mt-1 mb-3">
                      {product.description || "No description available"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-violet-400">
                        {price}
                      </span>
                      <button
                        onClick={() => handleRemove(product._id, product.name)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200"
                        title="Remove from favorites"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;
