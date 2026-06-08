import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  getFavorites,
  removeFavorite,
} from "../../../services/favoriteService";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import Footer from "../../shared/components/Footer";
import { FavoritesSkeleton } from "../loaders";


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
    return <FavoritesSkeleton count={6} />;
  }

  return (
    <div className="relative min-h-screen py-10 bg-[#0a0a0a] overflow-hidden flex flex-col justify-between">
      <div className="max-w-6xl mx-auto px-4 py-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-violet-400 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-5 w-full flex-1">
        <div className="flex items-center justify-center border-b border-white/[0.06] pb-5 mb-6 relative z-20">
          <div className="flex flex-col items-center justify-center gap-1">
            <h1 className="text-xl md:text-2xl font-black display-font text-white tracking-wide">
              My Favourites
            </h1>
            <p className="text-neutral-400 text-xs">
              {favorites.length > 0
                ? `${favorites.length} ${favorites.length === 1 ? "item" : "items"} saved`
                : "Your curated wishlist"}
            </p>

          </div>


        </div>

        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center py-12 relative"
          >
            <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-md rounded-3xl p-10 max-w-sm mx-auto shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-neutral-500 mb-5 mx-auto border border-white/5">
                <Heart className="text-neutral-400" size={20} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2 display-font">
                No Wishlist Items
              </h2>
              <p className="text-neutral-500 text-xs mb-6 leading-relaxed max-w-xs mx-auto">
                Explore our premium designer rental collection and tap the heart
                icon to save outfits.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-violet-600/20 hover:scale-102 cursor-pointer"
              >
                <span>Browse Outfits</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
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
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  className="relative flex flex-row bg-white/[0.02] border border-white/[0.08] backdrop-blur-md rounded-2xl overflow-hidden shadow-xl shadow-black/20 hover:border-violet-500/30 transition-all duration-300 group hover:shadow-2xl hover:shadow-violet-600/5 h-[140px] md:h-[180px]"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none z-20" />
                  <div className="relative w-32 p-2 md:w-48 h-full shrink-0 overflow-hidden">
                    <Link
                      to={`/product/${product._id}`}
                      className="block h-full w-full animate-none"
                    >
                      <img
                        src={mainImage}
                        alt={product.name}
                        className="w-full h-full rounded-md object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 via-transparent to-transparent opacity-60 transition-opacity duration-300" />
                    </Link>
                  </div>

                  {/* Right Side: Product Details */}
                  <div className="flex-1 p-3 md:p-5 flex flex-col justify-between relative min-w-0">
                    {/* Floating Remove Button inside Right Metadata Box */}
                    <button
                      onClick={() => handleRemove(product._id, product.name)}
                      className="absolute top-3 right-3 z-25 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-450 hover:text-red-450 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-300 cursor-pointer animate-none"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={13} />
                    </button>

                    <div className="pr-7 min-w-0">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20 inline-block mb-1.5">
                        {category}
                      </span>
                      <Link to={`/product/${product._id}`} className="animate-none">
                        <h3 className="text-sm md:text-base font-bold text-white tracking-wide truncate hover:text-violet-400 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-[11px] md:text-xs text-neutral-400 line-clamp-1 md:line-clamp-2 mt-1 leading-relaxed">
                        {product.description ||
                          "Premium designer wear from our collection."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.04] mt-auto">
                      <div>
                        <p className="text-[8px] uppercase tracking-wider text-neutral-500 font-bold animate-none">
                          Rental Price
                        </p>
                        <span className="text-xs md:text-sm font-black text-violet-400 mt-0.5 block">
                          {typeof price === "number"
                            ? `₹${price.toLocaleString()}`
                            : price}
                          <span className="text-[9px] font-medium text-neutral-450 ml-0.5">
                            /day
                          </span>
                        </span>
                      </div>

                      <Link
                        to={`/product/${product._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/10 border border-violet-500/20 text-[10px] md:text-xs font-bold text-violet-300 hover:text-white hover:bg-violet-600 hover:border-violet-500 transition-all duration-300 group/btn cursor-pointer"
                      >
                        <span>View Outfit</span>
                        <ArrowRight
                          size={11}
                          className="transition-transform group-hover/btn:translate-x-0.5"
                        />
                      </Link>
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
