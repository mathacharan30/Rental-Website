import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, Link, useLocation } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search") || "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [listingTab, setListingTab] = useState("rent");
  const ITEMS_PER_PAGE = 10;

  const isJewels = decodedCategory === "jewels";

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        if (decodedCategory) {
          const result = await getProductsByCategorySlug(
            decodedCategory,
            currentPage,
            ITEMS_PER_PAGE,
            searchQuery,
          );
          setItems(result.products || []);
          setPagination(result.pagination);
        } else {
          const data = await getAllProducts(searchQuery);
          setItems(data);
          setPagination(null); // No pagination for "All Products"
        }
      } catch (e) {
        console.error("[Products] Failed to load products", e);
        toast.error("Failed to load products");
        setItems([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [decodedCategory, currentPage, searchQuery]);

  // Reset to page 1 when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [decodedCategory, searchQuery]);

  const handleNextPage = () => {
    if (pagination && pagination.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (pagination && pagination.hasPrevPage) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const title = decodedCategory
    ? decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1)
    : "All Rentals";

  const displayTitle = searchQuery
    ? `Search results for "${searchQuery}"`
    : title;

  return (
    <motion.section
      className="pt-2 bg-[#0e0e0e] min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Helmet>
        <title>
          {displayTitle} — Rent Designer Outfits | People &amp; Style
        </title>
        <meta
          name="description"
          content={`Browse and rent ${decodedCategory || "designer"} outfits in Bangalore, Mysuru and across Karnataka. Premium ethnic wear rentals for every occasion.`}
        />
        <link
          rel="canonical"
          href={`https://peopleandstyle.in/products${decodedCategory ? `/${encodeURIComponent(decodedCategory)}` : ""}`}
        />
      </Helmet>
      <div className="max-w-7xl ">
        <div className="flex justify-center">
          <Link
            to="/"
            className="text-sm flex items-center gap-1.5 text-neutral-500 hover:text-violet-400 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>
        </div>

        <div className="flex flex-col justify-center items-center text-center">
          <div className="flex flex-col my-4 items-center">
            <h1 className="text-4xl font-bold display-font tracking-tight">
              <span className="text-white">{displayTitle}</span>
            </h1>
            {decodedCategory && !searchQuery && (
              <p className="text-sm text-neutral-500">
                {isJewels
                  ? listingTab === "rent"
                    ? "Jewels available for rent"
                    : "Jewels available for sale"
                  : `Curated rentals for ${decodedCategory}`}
              </p>
            )}
            {searchQuery && (
              <p className="text-sm text-neutral-500 mt-2">
                Showing results matching your search terms
              </p>
            )}
          </div>
        </div>

        {isJewels && !loading && (
          <div className="flex justify-center gap-2 mb-6">
            {["rent", "sale"].map((tab) => (
              <button
                key={tab}
                onClick={() => setListingTab(tab)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                  listingTab === tab
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        ) : (isJewels
            ? items.filter((p) => p.listingType === listingTab)
            : items
          ).length > 0 ? (
          <>
            <div className=" justify-center  items-center flex gap-2  flex-wrap mt-4">
              {(isJewels
                ? items.filter((p) => p.listingType === listingTab)
                : items
              ).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12 mb-8">
                <button
                  onClick={handlePrevPage}
                  disabled={!pagination.hasPrevPage}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    pagination.hasPrevPage
                      ? "bg-violet-600 hover:bg-violet-700 text-white"
                      : "bg-white/5 text-neutral-600 cursor-not-allowed"
                  }`}
                >
                  <ChevronLeft size={18} />
                  Prev
                </button>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-neutral-400">Page</span>
                  <span className="px-3 py-1 bg-violet-600 text-white rounded-lg font-semibold">
                    {pagination.currentPage}
                  </span>
                  <span className="text-neutral-400">of</span>
                  <span className="text-white font-semibold">
                    {pagination.totalPages}
                  </span>
                  <span className="text-neutral-600 ml-2">
                    ({pagination.totalProducts} total)
                  </span>
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={!pagination.hasNextPage}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    pagination.hasNextPage
                      ? "bg-violet-600 hover:bg-violet-700 text-white"
                      : "bg-white/5 text-neutral-600 cursor-not-allowed"
                  }`}
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg">
              {isJewels
                ? `No jewels available for ${listingTab}.`
                : `No products found${decodedCategory ? " in this category." : "."}`}
            </p>
          </div>
        )}
      </div>
      <Footer />
    </motion.section>
  );
};

export default Products;
