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
      className="pt-5 bg-base-off-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-2">
        <Link
          to="/"
          className="text-sm flex items-center gap-1 text-neutral-600 hover:text-neutral-900 hover:underline transition-colors"
        >
          <BiLeftArrow />
          Back to Home
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mt-3 mb-4 gap-3">
          <div>
            <h1 className="text-2xl font-medium text-base-charcoal tracking-tighter ">
              <span className="font-extrabold text-pink-800">//</span> {title}
            </h1>
            {decodedCategory && (
              <p className="text-sm text-neutral-600 mt-1">
                Showing curated rentals for {decodedCategory}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        ) : items.length > 0 ? (
          <div
            className=" grid
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
              gap-2
              sm:gap-2
              md:gap-2
              mt-4"
          >
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
