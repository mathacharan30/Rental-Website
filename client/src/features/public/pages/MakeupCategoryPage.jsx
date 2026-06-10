import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../../shared/components/Footer";
import { getMakeupCategories } from "../../../services/makeupCategoryService";
import { getMakeupPackagesByCategory } from "../../../services/makeupPackageService";
import PackageTile from "../components/makeup/PackageTile";
import PackageDetailModal from "../components/makeup/PackageDetailModal";

const MakeupCategoryPage = () => {
  const { categoryId } = useParams();
  const [activeTab, setActiveTab] = useState("__all__");
  const [selectedPkg, setSelectedPkg] = useState(null);

  const { data: allCategories = [] } = useQuery({
    queryKey: ["makeup-categories-raw"],
    queryFn: getMakeupCategories,
    staleTime: 1000 * 60 * 5,
  });

  const category = allCategories.find((c) => c._id === categoryId || c.id === categoryId);

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["makeup-packages", categoryId],
    queryFn: () => getMakeupPackagesByCategory(categoryId),
    staleTime: 0,
    enabled: !!categoryId && categoryId !== "undefined",
  });

  const subcategories = category?.subcategories || [];

  // Reset tab when category changes
  useEffect(() => { setActiveTab("__all__"); }, [categoryId]);

  const displayed =
    activeTab === "__all__"
      ? packages
      : packages.filter((p) => p.subcategory === activeTab);

  return (
    <motion.section
      className="pt-8 min-h-screen bg-[#0a0a0a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Helmet>
        <title>{category?.name ? `${category.name} Makeup Packages` : "Makeup Packages"}</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center">
          <Link
            to="/"
            className="text-sm flex items-center gap-1.5 text-neutral-500 hover:text-violet-400 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>
        </div>
        <div className="flex flex-col justify-center items-center text-center mb-2">
          <div className="flex flex-col my-4 items-center">
            <h1 className="text-4xl font-medium instrument-serif tracking-wide text-white">
              {category?.name || "Makeup Packages"}
            </h1>
            <p className="text-sm text-neutral-500 mt-2">
              Choose a package that fits your occasion and budget.
            </p>
          </div>
        </div>

        {subcategories.length > 0 && (
          <div className="flex justify-center gap-1.5 mb-6 flex-wrap">
            <button
              onClick={() => setActiveTab("__all__")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all capitalize ${activeTab === "__all__"
                ? "bg-violet-600 text-white shadow-inner shadow-violet-200/80 border-y-[1.55px] border-violet-300/60"
                : "bg-white/5 shadow-inner shadow-white/8 text-neutral-400 border-y-[1.55px] border-white/7 hover:bg-white/10 hover:text-white"
                }`}
            >
              All
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveTab(sub)}
                className={`px-4 py-2 rounded-full   text-sm font-medium transition-all capitalize ${activeTab === sub
                  ? "bg-violet-600 text-white shadow-inner shadow-violet-200/80 border-y-[1.55px] border-violet-300/60"
                  : "bg-white/5 shadow-inner shadow-white/8 text-neutral-400 border-y-[1.55px] border-white/7 hover:bg-white/10 hover:text-white"
                  }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="justify-center items-center flex gap-2 flex-wrap mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-42 md:w-56 h-72 rounded-3xl bg-white/5 border border-white/10 animate-pulse p-2" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            No packages available{activeTab !== "__all__" ? ` for "${activeTab}"` : ""}.
          </div>
        ) : (
          <div className="justify-center md:justify-start items-center flex gap-2 flex-wrap mt-4">
            {displayed.map((pkg) => (
              <PackageTile key={pkg._id} pkg={pkg} onClick={setSelectedPkg} />
            ))}
          </div>
        )}
      </div>

      <Footer />

      <AnimatePresence>
        {selectedPkg && (
          <PackageDetailModal pkg={selectedPkg} onClose={() => setSelectedPkg(null)} />
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default MakeupCategoryPage;
