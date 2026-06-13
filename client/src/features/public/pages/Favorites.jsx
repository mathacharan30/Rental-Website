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
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-violet-400 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Home
        </button>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-5 w-full flex-1">
        <div className="text-center pb-5 mb-6 border-b border-white/6">
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            My Favourites
          </h1>
          <p className="text-neutral-500 text-xs mt-1">
            {favorites.length > 0
              ? `${favorites.length} ${favorites.length === 1 ? "item" : "items"} saved`
              : "Your curated wishlist"}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/2 border border-white/6 rounded-2xl p-10 max-w-md mx-auto shadow-xl">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-neutral-500 mb-4 mx-auto">
                <Heart size={20} />
              </div>
              <h2 className="text-lg font-bold text-white mb-1.5">
                No Wishlist Items
              </h2>
              <p className="text-neutral-500 text-xs mb-6 max-w-xs mx-auto leading-relaxed">
                Explore our premium designer rental collection and tap the heart icon to save outfits.
              </p>
              <Link
                to="/products"
                className="px-5 py-2.5 bg-violet-600 text-white shadow-inner shadow-white border-b-[1.55px] border-violet-300/40 hover:bg-violet-500 rounded-full font-bold text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Browse Outfits</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {favorites.map((fav) => {
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
                <div
                  key={fav._id}
                  className="relative flex gap-4 bg-white/2 border border-white/6 hover:border-white/10 rounded-2xl p-4 transition-all duration-300 group"
                >
                  {/* Image */}
                  <Link
                    to={`/product/${product._id}`}
                    className="w-24 h-24 md:w-28 md:h-28 shrink-0 overflow-hidden rounded-xl border border-white/5 bg-neutral-900"
                  >
                    <img
                      src={mainImage}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  {/* Right Side: Product Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                            {category}
                          </span>
                          <Link to={`/product/${product._id}`}>
                            <h3 className="font-semibold text-white text-sm md:text-base truncate hover:text-violet-400 transition-colors mt-0.5">
                              {product.name}
                            </h3>
                          </Link>
                        </div>

                        <button
                          onClick={() => handleRemove(product._id, product.name)}
                          className="p-1.5 rounded-full bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-neutral-400 border border-white/5 transition-all cursor-pointer shrink-0"
                          title="Remove from wishlist"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <p className="text-xs text-neutral-400 line-clamp-1 mt-1 leading-relaxed">
                        {product.description || "Premium designer wear from our collection."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
                      <div>
                        <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">
                          Rental Price
                        </span>
                        <p className="text-xs md:text-sm font-bold text-white mt-0.5">
                          {typeof price === "number" ? `₹${price.toLocaleString()}` : price}
                          <span className="text-[10px] text-neutral-400 font-normal ml-0.5">/day</span>
                        </p>
                      </div>

                      <Link
                        to={`/product/${product._id}`}
                        className="px-3.5 py-1.5 bg-violet-600 text-white shadow-inner shadow-white border-b-[1.55px] border-violet-300/40 hover:bg-violet-500 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>View Details</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;
