import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../services/categoryService";
import toast from "react-hot-toast";
import { ArrowBigLeft, ArrowRight } from "lucide-react";

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
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCategories();
        if (Array.isArray(data) && data.length) {
          setCategories(data.map(mapCategory));
        }
      } catch (e) {
        console.error("[Categories] Failed to load categories", e);
        toast.error("Failed to load categories");
      }
    })();
  }, []);

  return (
    <section id="categories" className="py-15">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold display-font tracking-tight text-white">
            Browse <span className="text-violet-400">Categories</span>
          </h2>
          <p className="mt-3 text-neutral-500 text-sm max-w-lg mx-auto">
            Explore our curated collection for every occasion — from grand
            weddings to special celebrations.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((c) => (
            <div key={c.id}>
              <Link
                to={`/products/${encodeURIComponent((c.name || "").toLowerCase())}`}
                className="relative group overflow-hidden rounded-bl-3xl rounded-tr-3xl h-60 w-40 md:w-48 md:h-70 flex items-end 
             bg-neutral-900/40 backdrop-blur-md border border-white/10
             hover:shadow-[0_12px_40px_rgba(139,92,246,0.25)]
             transition-all duration-300"
                aria-label={`View ${c.name}`}
              >
                <img
                  src={c.imageUrl}
                  alt={c.name}
                  className="absolute inset-0 w-full h-full object-cover 
               group-hover:scale-110 transition-transform duration-500 ease-out"
                />

                <div
                  className="absolute inset-0 bg-gradient-to-t 
                  from-black/80 via-black/30 to-transparent 
                  group-hover:from-black/70 transition-all duration-300"
                />

                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 
                  bg-violet-500/10 blur-2xl transition duration-500"
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
