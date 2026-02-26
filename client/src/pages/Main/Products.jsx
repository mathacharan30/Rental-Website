import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import { motion } from "framer-motion";
import { BiLeftArrow } from "react-icons/bi";
import Footer from "../../components/Footer";
import {
  getAllProducts,
  getProductsByCategorySlug,
} from "../../services/productService";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

const Products = () => {
  const { category } = useParams();

  const decodedCategory = category
    ? decodeURIComponent(category).toLowerCase()
    : null;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        if (decodedCategory) {
          const data = await getProductsByCategorySlug(decodedCategory);
          setItems(data);
        } else {
          const data = await getAllProducts();
          setItems(data);
        }
      } catch (e) {
        console.error("[Products] Failed to load products", e);
        toast.error("Failed to load products");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [decodedCategory]);

  const title = decodedCategory
    ? decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1)
    : "All Products";

  return (
    <motion.section
      className="pt-8 bg-[#0e0e0e] min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <Link
          to="/"
          className="text-sm flex items-center gap-1.5 text-neutral-500 hover:text-violet-400 transition-colors"
        >
          <BiLeftArrow />
          Back to Home
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mt-4 mb-6 gap-3">
          <div>
            <h1 className="text-3xl font-bold display-font tracking-tight">
              <span className="text-white">{title}</span>
            </h1>
            {decodedCategory && (
              <p className="text-sm text-neutral-500 mt-1">
                Curated rentals for {decodedCategory}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg">
              No products found{decodedCategory ? " in this category." : "."}
            </p>
          </div>
        )}
      </div>
      <Footer />
    </motion.section>
  );
};

export default Products;
