import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getCategories } from "../services/categoryService";
import toast from "react-hot-toast";

function mapCategory(c = {}) {
  return {
    id: c._id || c.id,
    name: c.name || "",
    image: c.image || "/saree.jpg",
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
    <section id="categories" className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-semibold display-font tracking-tight text-white">
            Browse <span className="text-violet-400">Categories</span>
          </h2>
          <p className="mt-3 text-neutral-500 text-sm max-w-lg mx-auto">
            Explore our curated collection for every occasion — from grand
            weddings to special celebrations.
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                to={`/products/${encodeURIComponent(
                  (c.name || "").toLowerCase(),
                )}`}
                className="relative group overflow-hidden rounded-xl h-48 w-40 md:w-52 md:h-64 flex items-end transition-all duration-300 hover:shadow-lg hover:shadow-black/30"
                aria-label={`View ${c.name}`}
              >
                <img
                  src={c.image.url}
                  alt={c.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="relative w-full p-3 flex items-center justify-between">
                  <span className="text-white font-semibold text-sm tracking-tight">
                    {c.name}
                  </span>
                  <span className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 text-lg">
                    →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
