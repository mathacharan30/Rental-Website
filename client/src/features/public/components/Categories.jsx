import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../../services/categoryService";
import { getMakeupCategories } from "../../../services/makeupCategoryService";
import toast from "react-hot-toast";
import { ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import OptimizedImage from "../../shared/components/OptimizedImage";
import { CategoriesSkeleton } from "../loaders";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineSquares2X2 } from "react-icons/hi2";

const tabVariants = {
  hidden: { opacity: 0, filter: "blur(8px)", scale: 0.98 },
  visible: { opacity: 1, filter: "blur(0px)", scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, filter: "blur(8px)", scale: 0.98, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }
};

function mapCategory(c = {}) {
  const imageSource = c.image || "/saree.jpg";
  const imageUrl =
    typeof imageSource === "string"
      ? imageSource
      : imageSource.url || "/saree.jpg";

  return {
    id: c._id || c.id,
    name: c.name || "",
    imageUrl,
  };
}

const Categories = () => {
  const [activeTab, setActiveTab] = useState("categories");
  const {
    data: categories = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await getCategories();
      return Array.isArray(data) ? data.map(mapCategory) : [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });

  const {
    data: makeupCategories = [],
    isLoading: makeupLoading,
    isError: makeupError,
    refetch: makeupRefetch,
  } = useQuery({
    queryKey: ["makeup-categories"],
    queryFn: async () => {
      const data = await getMakeupCategories();
      return Array.isArray(data) ? data.map(mapCategory) : [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });

  useEffect(() => {
    if (isError) toast.error("Failed to load categories");
  }, [isError]);

  useEffect(() => {
    if (makeupError) toast.error("Failed to load makeup categories");
  }, [makeupError]);

  return (
    <section id="categories" className="py-15">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10 overflow-hidden py-1">
          <AnimatePresence mode="wait">
            <motion.h2
              key={activeTab}
              initial={{ opacity: 0, filter: "blur(6px)", y: 4 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(6px)", y: -4 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl md:text-4xl font-medium instrument-serif tracking-wide text-white"
            >
              - Browse{" "}
              <span className="text-violet-400 italic">
                {activeTab === "categories" ? "Categories -" : "Combos -"}
              </span>
            </motion.h2>
          </AnimatePresence>
          <p className="mt-3 text-neutral-500  text-sm max-w-lg mx-auto">
            Explore our curated collection for every occasion — from grand
            weddings to special celebrations.
          </p>
        </div>

        <div className="flex items-center justify-center gap-1 mb-8">
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 rounded-tl-2xl rounded-br-2xl text-sm font-medium transition-all inline-flex items-center gap-2 border ${activeTab === "categories" ? "bg-linear-to-r from-violet-600 to-fuchsia-500 border-violet-400 text-white" : "bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:border-violet-500/40"}`}
          >
            <HiOutlineSquares2X2 size={14} /> Categories
          </button>
          <button
            onClick={() => setActiveTab("combos")}
            className={`px-4 py-2 rounded-tr-2xl rounded-bl-2xl text-sm font-medium transition-all border inline-flex items-center gap-2 ${activeTab === "combos" ? "bg-linear-to-r from-fuchsia-500 to-violet-700 border-violet-400 text-white" : "bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:border-violet-500/40"}`}
          >
            <Sparkles size={14} /> Makeup
          </button>
        </div>

        {activeTab === "categories" ? (
          <motion.div
            key="categories"
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-wrap gap-1.5 justify-center"
          >
            {isLoading ? (
              <CategoriesSkeleton count={6} />
            ) : isError ? (
              <div className="flex flex-col items-center gap-4 py-12 text-neutral-400">
                <p className="text-sm">Could not load categories.</p>
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-violet-500/10 border border-violet-400/30 text-violet-300 hover:bg-violet-500/20 transition-all text-sm"
                >
                  <RefreshCw size={14} /> Try again
                </button>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-neutral-400 py-12">No categories found.</div>
            ) : (
              categories.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.5,
                  }}
                >
                  <Link
                    to={`/products/${encodeURIComponent((c.name || "").toLowerCase())}`}
                    className="relative group overflow-hidden rounded-bl-3xl rounded-tr-3xl h-56 w-38 md:w-42 md:h-64 flex items-end
                 bg-purple-950/40 border border-white/10
                 hover:shadow-[0_12px_40px_rgba(139,92,246,0.25)]
                 hover:scale-[1.03] transition-all duration-300"
                    aria-label={`View ${c.name}`}
                  >
                    <OptimizedImage
                      url={c.imageUrl}
                      type="category"
                      alt={c.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover
                   group-hover:scale-90 transition-transform duration-500 ease-out  rounded-bl-3xl rounded-tr-3xl"
                    />
                    <div
                      className="absolute inset-0 pointer-events-none overflow-hidden rounded-bl-3xl rounded-tr-3xl z-10 backdrop-blur-xs"
                      style={{
                        maskImage: "linear-gradient(to top, black 0%, black 10%, transparent 50%)",
                        WebkitMaskImage: "linear-gradient(to top, black 0%, black 10%, transparent 50%)",
                      }}
                    />
                    <div className="relative w-full pb-3 px-4 pt-10 flex items-center justify-between z-20">
                      <span className="text-white font-medium text-xs uppercase md:text-sm">
                        {c.name}
                      </span>
                      <span
                        className="flex items-center justify-center w-8 h-8 text-white
                         group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all duration-300"
                      >
                        <ArrowRight size={24} className="rotate-315" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="makeup"
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-wrap gap-1.5 justify-center"
          >
            {makeupLoading ? (
              <CategoriesSkeleton count={4} />
            ) : makeupError ? (
              <div className="flex flex-col items-center gap-4 py-12 text-neutral-400">
                <p className="text-sm">Could not load makeup categories.</p>
                <button
                  onClick={() => makeupRefetch()}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-violet-500/10 border border-violet-400/30 text-violet-300 hover:bg-violet-500/20 transition-all text-sm"
                >
                  <RefreshCw size={14} /> Try again
                </button>
              </div>
            ) : makeupCategories.length === 0 ? (
              <div className="text-neutral-400 py-12">No makeup categories found.</div>
            ) : (
              makeupCategories.map((c) => {
                const cid = c.id || c._id;
                const imageUrl = c.imageUrl || c.image?.url || "/saree.jpg";
                return (
                  <motion.div
                    key={cid}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Link
                      to={`/makeup/${cid}`}
                      className="relative group overflow-hidden rounded-t-[75px] rounded-xl h-56 w-36 md:w-42 md:h-66 flex items-end
                       bg-fuchsia-950/20 border border-white/10
                       hover:shadow-[0_12px_40px_rgba(217,70,239,0.25)]
                       hover:scale-[1.03] transition-all duration-300"
                      aria-label={c.name}
                    >
                      <OptimizedImage
                        url={imageUrl}
                        type="category"
                        alt={c.name}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover
                         group-hover:scale-90 transition-transform duration-500 ease-out rounded-t-[75px] rounded"
                      />
                      <div
                        className="absolute inset-0 pointer-events-none overflow-hidden rounded-t-full rounded-b-2xl z-10 backdrop-blur-xs"
                        style={{
                          maskImage: "linear-gradient(to top, black 0%, black 10%, transparent 50%)",
                          WebkitMaskImage: "linear-gradient(to top, black 0%, black 10%, transparent 50%)",
                        }}
                      />
                      <div className="relative w-full pb-4 px-4 pt-10 flex items-center justify-between z-20">
                        <span className="text-white font-medium text-xs uppercase md:text-sm ">
                          {c.name}
                        </span>
                        <span className="flex items-center justify-center w-8 h-8 text-white
                         group-hover:text-fuchsia-400 group-hover:translate-x-0.5 transition-all duration-300">
                          <ArrowRight size={20} className="rotate-315" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

      </div>
    </section>
  );
};

export default Categories;
