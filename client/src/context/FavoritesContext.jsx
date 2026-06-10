/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";
import { addFavorite, removeFavorite } from "../services/favoriteService";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { firebaseUser, role, loading: authLoading } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const isCustomer = !authLoading && !!firebaseUser && role === "customer";

  useEffect(() => {
    if (!isCustomer) {
      setFavoriteIds(new Set());
      return;
    }

    let cancelled = false;
    api
      .get("/api/favorites/ids")
      .then((res) => {
        if (!cancelled) setFavoriteIds(new Set(res.data.ids));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isCustomer]);

  const isFavorite = useCallback(
    (productId) => favoriteIds.has(productId),
    [favoriteIds]
  );

  const toggle = useCallback(
    async (productId) => {
      const wasOn = favoriteIds.has(productId);

      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasOn) next.delete(productId);
        else next.add(productId);
        return next;
      });

      try {
        if (wasOn) {
          await removeFavorite(productId);
        } else {
          await addFavorite(productId);
        }
      } catch (error) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (wasOn) next.add(productId);
          else next.delete(productId);
          return next;
        });
        throw error;
      }
    },
    [favoriteIds]
  );

  return (
    <FavoritesContext.Provider value={{ isFavorite, toggle, isCustomer }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside <FavoritesProvider>");
  return ctx;
}
