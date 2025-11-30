import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
        console.log("data", data);
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
    <section id="categories" className="pb-16 pt-16  rounded-b-4xl">
      <div className="max-w-7xl mx-auto px-2">
        <h2 className=" text-2xl font-medium text-black tracking-tighter text-center ">
          <span className="font-extrabold  text-pink-800">/</span> Browse
          Categories
        </h2>

        <p className="mt-2 text-neutral-800 text-xs md:text-sm text-center max-w-2xl mx-auto">
          Explore our premium collection for every occasion, from grand weddings
          to intimate gatherings.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/products/${encodeURIComponent(
                (c.name || "").toLowerCase()
              )}`}
              className="relative group overflow-hidden rounded-xl h-43 w-37 md:w-52 md:h-58 transition-all items-center flex justify-center duration-300"
              aria-label={`View ${c.name}`}
            >
              <img
                src={c.image.url}
                alt={c.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 w-full text-center px-3 py-1 bg-black/10  text-white text-sm sm:text-base  tracking-tight backdrop-blur-sm">
                {c.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
