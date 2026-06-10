import { useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useFavorites } from "../../../context/FavoritesContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const FavoriteButton = ({ productId, className = "", size = 20 }) => {
  const [loading, setLoading] = useState(false);
  const { firebaseUser, loading: authLoading } = useAuth();
  const { isFavorite, toggle, isCustomer } = useFavorites();
  const navigate = useNavigate();

  const favorited = isFavorite(productId);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!firebaseUser) {
      toast.error("Please login to add favorites");
      navigate("/login");
      return;
    }

    if (!isCustomer) {
      toast.error("Only customers can add favorites");
      return;
    }

    setLoading(true);
    try {
      await toggle(productId);
      toast.success(favorited ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update favorites");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading || authLoading}
      className={`p-1.5 rounded-full transition-all backdrop-blur-md duration-200 ${
        favorited
          ? "bg-rose-500/20 text-rose-500 border border-rose-400/40 hover:bg-rose-500/30"
          : isCustomer
            ? "bg-white/5 text-rose-500 border border-rose-300/20 hover:bg-rose-500/15 hover:text-rose-600"
            : " text-rose-400 border border-rose-500/30 hover:bg-rose-500/12 hover:text-rose-500"
      } ${loading || authLoading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      title={
        favorited
          ? "Remove from favorites"
          : isCustomer
            ? "Add to favorites"
            : "Login as customer to add favorites"
      }
    >
      <Heart
        size={size}
        fill={favorited ? "currentColor" : "none"}
        className="transition-all duration-200"
      />
    </button>
  );
};

export default FavoriteButton;
