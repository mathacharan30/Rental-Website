import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useParams, Link, useLocation } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Footer from "../../shared/components/Footer";
import {
  getAllProducts,
  getProductsByCategorySlug,
} from "../../../services/productService";
import Loader from "../../shared/components/Loader";

const Products = () => {
  const { category } = useParams();

  const decodedCategory = category
    ? decodeURIComponent(category).toLowerCase()
    : null;

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search") || "";

  const [currentPage, setCurrentPage] = useState(1);
  const [listingTab, setListingTab] = useState("rent");
  const ITEMS_PER_PAGE = 10;

  const isJewels = decodedCategory === "jewels";

  const { data: productsData, isLoading: loading } = useQuery({
    queryKey: decodedCategory
      ? [
          "products",
          decodedCategory,
          currentPage,
          searchQuery,
          isJewels ? listingTab : "",
        ]
      : ["products", "all", searchQuery],
    queryFn: async () => {
      if (decodedCategory) {
        const result = await getProductsByCategorySlug(
          decodedCategory,
          currentPage,
          ITEMS_PER_PAGE,
          searchQuery,
          isJewels ? listingTab : "",
        );
        return result;
      } else {
        const data = await getAllProducts(searchQuery);
        return { products: data, pagination: null };
      }
    },
    keepPreviousData: true,
    staleTime: 0,
    cacheTime: 0,
  });

  const items = productsData?.products || [];
  const pagination = productsData?.pagination;

  // Reset to page 1 when category, search, or listing tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [decodedCategory, searchQuery, listingTab]);

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
      <div className="max-w-7xl mx-auto ">
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
            <h1 className="text-4xl font-medium instrument-serif tracking-wide">
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
                  className={`flex items-center gap-2 p-2 rounded-lg font-medium transition-all ${
                    pagination.hasPrevPage
                      ? "bg-violet-600 hover:bg-violet-700 text-white"
                      : "bg-white/5 text-neutral-600 cursor-not-allowed"
                  }`}
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-2 text-sm">
                  <span className="px-3 py-1  text-white rounded-lg font-semibold">
                    {pagination.currentPage}
                  </span>
                  <span className="text-neutral-400">of</span>
                  <span className="text-white font-semibold">
                    {pagination.totalPages}
                  </span>
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={!pagination.hasNextPage}
                  className={`flex items-center gap-2 p-2 rounded-lg font-medium transition-all ${
                    pagination.hasNextPage
                      ? "bg-violet-600 hover:bg-violet-700 text-white"
                      : "bg-white/5 text-neutral-600 cursor-not-allowed"
                  }`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg">
              {isJewels
                ? `No jewels available for ${listingTab === "rent" ? "rent" : "sale"}.`
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
