import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../../services/categoryService";
import toast from "react-hot-toast";
import { ArrowRight, Sparkles } from "lucide-react";
import OptimizedImage from "../../shared/components/OptimizedImage";
import { CategoriesSkeleton } from "../loaders";
import { comboCategories } from "../../../data/combos";

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
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const data = await getCategories();
        return Array.isArray(data) ? data.map(mapCategory) : [];
      } catch (e) {
        toast.error("Failed to load categories");
        throw e;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });

  return (
    <section id="categories" className="py-15">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-medium instrument-serif tracking-wide text-white">
            - Browse{" "}
            <span className="text-violet-400 italic">
              {activeTab === "categories" ? "Categories -" : "Combos -"}
            </span>
          </h2>
          <p className="mt-3 text-neutral-500  text-sm max-w-lg mx-auto">
            Explore our curated collection for every occasion — from grand
            weddings to special celebrations.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${activeTab === "categories" ? "bg-violet-600 border-violet-500 text-white" : "bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:border-violet-500/40"}`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab("combos")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border inline-flex items-center gap-2 ${activeTab === "combos" ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 border-violet-400 text-white" : "bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:border-violet-500/40"}`}
          >
            <Sparkles size={14} /> Makeup
          </button>
        </div>

        {activeTab === "categories" ? (
          <div className="flex flex-wrap gap-2 justify-center">
            {isLoading ? (
              <CategoriesSkeleton count={6} />
            ) : isError ? (
              <div className="text-red-400 py-12">
                Failed to load categories.
              </div>
            ) : categories.length === 0 ? (
              <div className="text-neutral-400 py-12">No categories found.</div>
            ) : (
              categories.map((c) => (
                <div key={c.id}>
                  <Link
                    to={`/products/${encodeURIComponent((c.name || "").toLowerCase())}`}
                    className="relative group overflow-hidden rounded-bl-3xl rounded-tr-3xl h-58 w-40 md:w-48 md:h-70 flex items-end 
               bg-neutral-900/40 border border-white/10
               hover:shadow-[0_12px_40px_rgba(139,92,246,0.25)]
               hover:transform hover:scale-[1.03] transition-transform duration-300 bg-purple-950/40
               transition-all duration-300"
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

                    <div className="relative w-full p-4 flex items-center justify-between">
                      <span className="text-white font-light text-sm uppercase md:text-base tracking-tight">
                        {c.name}
                      </span>

                      <span
                        className="flex items-center justify-center w-8 h-8 rounded-full 
                       text-white text-sm
                       transition-all duration-300"
                      >
                        <ArrowRight size={24} className="rotate-315" />
                      </span>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {comboCategories.map((combo) => (
              <Link
                key={combo.slug}
                to={`/combos/${combo.slug}`}
                className="group overflow-hidden rounded-bl-4xl rounded-tr-4xl  border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.22),transparent_35%),linear-gradient(145deg,rgba(18,18,18,0.98),rgba(26,26,26,0.82))] p-2 md:p-3 hover:border-violet-400/40 transition-all duration-300
               bg-neutral-900/40"
              >
                <div className="grid grid-cols-1 md:grid-cols-[0.95fr_1.05fr] gap-4 items-stretch">
                  <div className="overflow-hidden rounded-tr-3xl rounded-bl-3xl border border-white/10">
                    <OptimizedImage
                      url={`/Combo/bridal3.jpeg`}
                      type="category"
                      alt={combo.title}
                      className="h-[40vh] md:h-[40vh] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col justify-between gap-4 p-1 md:p-2 text-left">
                    <div>
                      <h3 className="mt-3 text-2xl md:text-3xl font-semibold text-white instrument-serif">
                        {combo.title}
                      </h3>
                      <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                        {combo.subtitle}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-lg font-bold text-violet-300">
                        {combo.priceNote}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-300">
                          View package details
                        </span>
                        <span className="flex h-9 w-9 items-center justify-center text-violet-300 transition-transform duration-300 group-hover:translate-x-1">
                          <ArrowRight size={24} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;
