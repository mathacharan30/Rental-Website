import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toggleFavorite, checkFavorite } from "../services/favoriteService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const FavoriteButton = ({ productId, className = "", size = 20 }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { firebaseUser, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const canManageFavorites = firebaseUser && role === "customer";

  useEffect(() => {
    // Only check favorite status if user is logged in as customer
    if (firebaseUser && role === "customer" && productId) {
      checkFavorite(productId)
        .then(setIsFavorite)
        .catch((err) => {
          // Silently fail - user might not have permission or product doesn't exist
          console.error("[FavoriteButton] Check error:", err);
          setIsFavorite(false);
        });
    } else {
      // Reset favorite state if user logs out or changes role
      setIsFavorite(false);
    }
  }, [firebaseUser, role, productId]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!firebaseUser) {
      toast.error("Please login to add favorites");
      navigate("/login");
      return;
    }

    if (role !== "customer") {
      toast.error("Only customers can add favorites");
      return;
    }

    setLoading(true);
    try {
      await toggleFavorite(productId, isFavorite);
      setIsFavorite(!isFavorite);
      toast.success(
        isFavorite ? "Removed from favorites" : "Added to favorites",
      );
    } catch (error) {
      console.error("[FavoriteButton] Toggle error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update favorites",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading || authLoading}
      className={`p-2 rounded-full transition-all duration-200 ${
        isFavorite
          ? "bg-rose-500/20 text-rose-500 border border-rose-400/40 hover:bg-rose-500/30"
          : canManageFavorites
            ? "bg-white/20 text-rose-500 border border-rose-300/40 hover:bg-rose-500/15 hover:text-rose-600"
            : "bg-white/20 text-rose-400 border border-rose-300/30 hover:bg-rose-500/12 hover:text-rose-500"
      } ${loading || authLoading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      title={
        isFavorite
          ? "Remove from favorites"
          : canManageFavorites
            ? "Add to favorites"
            : "Login as customer to add favorites"
      }
    >
      <Heart
        size={size}
        fill={isFavorite ? "currentColor" : "none"}
        className="transition-all duration-200"
      />
    </button>
  );
};

export default FavoriteButton;
