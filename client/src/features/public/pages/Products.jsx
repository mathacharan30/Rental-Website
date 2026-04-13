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
import { ProductListSkeleton } from "../loaders";

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
        {/* ── Per-category SEO titles, descriptions, keywords ── */}
        {(() => {
          const cat = decodedCategory;
          if (cat === "lehenga")
            return (
              <>
                <title>
                  Bridal Lehenga on Rent in Mysuru &amp; Bangalore | People
                  &amp; Style
                </title>
                <meta
                  name="description"
                  content="Rent designer bridal lehenga in Mysuru and Bangalore. Browse red bridal lehenga, heavy bridal lehenga, reception lehenga, engagement lehenga, half saree &amp; more. Affordable lehenga rental delivered to your door."
                />
                <meta
                  name="keywords"
                  content="bridal lehenga on rent in Mysuru, bridal lehenga on rent in Bangalore, bridal lehenga rental Mysuru, bridal lehenga rental Bangalore, designer lehenga on rent, wedding lehenga rental, red bridal lehenga on rent, heavy bridal lehenga on rent, reception lehenga on rent, engagement lehenga on rent, party wear lehenga on rent, half saree on rent, bridal saree on rent, silk saree rental, wedding saree on rent, lehenga on rent"
                />
              </>
            );
          if (cat === "gowns")
            return (
              <>
                <title>
                  Bridal Gown on Rent in Mysuru &amp; Bangalore | Wedding Gown
                  Rental
                </title>
                <meta
                  name="description"
                  content="Rent bridal gown, wedding gown, reception gown &amp; designer gown in Mysuru and Bangalore. White bridal gown, maternity gown, pre-wedding &amp; photoshoot gown rental. Affordable prices delivered to your door."
                />
                <meta
                  name="keywords"
                  content="wedding gown on rent in Mysuru, wedding gown on rent in Bangalore, bridal gown on rent, reception gown on rent, white bridal gown rental, designer gown on rent, party wear gown on rent, maternity gown on rent, pre wedding gown on rent, photoshoot gown on rent, long gown on rent Mysuru, western gown rental Bangalore, bridal dress rental in Mysuru, bridal dress rental in Bangalore"
                />
              </>
            );
          if (cat === "men")
            return (
              <>
                <title>
                  Men Wedding Dress on Rent in Mysuru &amp; Bangalore |
                  Sherwani, Blazer, Suit
                </title>
                <meta
                  name="description"
                  content="Rent sherwani, blazer, suit, tuxedo &amp; groom wear in Mysuru and Bangalore. Men wedding dress rental, indo western on rent, coat suit on rent. Affordable men ethnic wear rental."
                />
                <meta
                  name="keywords"
                  content="men wedding dress on rent, groom wear on rent, sherwani on rent, blazer on rent, suit on rent, tuxedo on rent, men blazer rental Bangalore, sherwani rental Mysuru, wedding suit on rent, men ethnic wear on rent, indo western on rent, coat suit on rent, men collection on rent Bangalore"
                />
              </>
            );
          if (cat === "jewels")
            return (
              <>
                <title>
                  Bridal Jewellery on Rent in Mysuru &amp; Bangalore | Temple
                  Jewellery Rental
                </title>
                <meta
                  name="description"
                  content="Rent bridal jewellery, temple jewellery, imitation jewellery &amp; wedding accessories in Mysuru and Bangalore. Necklace set on rent, bridal crown on rent, bangles on rent. Affordable jewellery rental."
                />
                <meta
                  name="keywords"
                  content="bridal jewellery on rent, temple jewellery on rent, imitation jewellery on rent, bridal accessories on rent, wedding jewels on rent, jewellery rental Mysuru, jewellery rental Bangalore, necklace set on rent, bridal crown on rent, bangles on rent, wedding accessories rental"
                />
              </>
            );
          // Default — all products
          return (
            <>
              <title>
                Clothes on Rent in Mysuru &amp; Bangalore | Designer Rental
                Outfits
              </title>
              <meta
                name="description"
                content="Browse all rental outfits at People &amp; Style — bridal lehenga, wedding gown, sherwani, bridal saree, jewellery &amp; more on rent in Mysuru and Bangalore. Premium clothing rental for weddings &amp; events."
              />
              <meta
                name="keywords"
                content="clothes on rent in Mysuru, clothes on rent in Bangalore, rental outfits in Mysuru, rental outfits in Bangalore, dress rental in Mysuru, dress rental in Bangalore, bridal wear on rent, wedding dress rental, clothing rental Bangalore"
              />
            </>
          );
        })()}
        <link
          rel="canonical"
          href={`https://peopleandstyle.in/products${decodedCategory ? `/${encodeURIComponent(decodedCategory)}` : ""}`}
        />
        <meta
          property="og:title"
          content={`${decodedCategory ? decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1) + " on Rent" : "Rental Outfits"} in Mysuru & Bangalore | People & Style`}
        />
        <meta
          property="og:description"
          content={`Rent ${decodedCategory || "designer outfits"} in Mysuru and Bangalore. Premium clothing rental delivered to your door.`}
        />
        <meta
          property="og:url"
          content={`https://peopleandstyle.in/products${decodedCategory ? `/${encodeURIComponent(decodedCategory)}` : ""}`}
        />
        <meta property="og:type" content="website" />
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
          <div className="py-6 md:py-10">
            <ProductListSkeleton count={10} />
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
