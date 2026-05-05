import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Sparkles, MessageCircle } from "lucide-react";
import Footer from "../../shared/components/Footer";
import OptimizedImage from "../../shared/components/OptimizedImage";
import { comboCategories } from "../../../data/combos";
import { openWhatsApp } from "../../../services/whatsapp";

const cardMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
};

const BridalCombo = () => {
  const { slug } = useParams();
  const combo = useMemo(
    () =>
      comboCategories.find((item) => item.slug === slug) || comboCategories[0],
    [slug],
  );
  const [selectedPackageId, setSelectedPackageId] = useState(
    combo.packages[0]?.id || "",
  );
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  useEffect(() => {
    setSelectedPackageId(combo.packages[0]?.id || "");
    setSelectedAddOns([]);
  }, [combo.slug]);

  const selectedPackage =
    combo.packages.find((item) => item.id === selectedPackageId) ||
    combo.packages[0];

  const toggleAddOn = (addOnId) => {
    setSelectedAddOns((current) =>
      current.includes(addOnId)
        ? current.filter((id) => id !== addOnId)
        : [...current, addOnId],
    );
  };

  const handleWhatsApp = () => {
    const selectedAddOnLabels = combo.addOns
      .filter((addOn) => selectedAddOns.includes(addOn.id))
      .map((addOn) => addOn.label);

    openWhatsApp({
      action: "enquiry",
      link: window.location.href,
      heading: "Bridal Combo Booking",
      intro: "Hello! I'd like to book a bridal combo package.",
      product: {
        title: `${combo.title} - ${selectedPackage?.name || "Package"}`,
        category: "Bridal Combo",
        price: `₹${selectedPackage?.price?.toLocaleString() || "0"}`,
        id: `${combo.slug}-${selectedPackage?.id || "package"}`,
      },
      extraLines: [
        `• Package: ${selectedPackage?.name || "N/A"}`,
        `• Package Price: ₹${selectedPackage?.price?.toLocaleString() || "0"}`,
        selectedPackage?.description
          ? `• Notes: ${selectedPackage.description}`
          : null,
        selectedPackage?.inclusions?.length
          ? `• Inclusions: ${selectedPackage.inclusions.join(", ")}`
          : null,
        selectedAddOnLabels.length
          ? `• Add-ons: ${selectedAddOnLabels.join(", ")}`
          : `• Add-ons: None selected`,
      ],
      closingNote:
        "Please share the next steps and availability for this combo.",
    });
  };

  return (
    <motion.div className="bg-[#0e0e0e] min-h-screen" {...cardMotion}>
      <Helmet>
        <title>{combo.title} Packages | People &amp; Style</title>
        <meta
          name="description"
          content={`${combo.title} packages from ₹5,000 to ₹20,000 with makeup, saree draping, hairstyling and premium add-ons.`}
        />
        <meta
          property="og:title"
          content={`${combo.title} Packages | People & Style`}
        />
        <meta property="og:description" content={combo.subtitle} />
        <meta property="og:image" content={combo.image} />
        <meta
          property="og:url"
          content={`https://peopleandstyle.in/combos/${combo.slug}`}
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 pt-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-violet-400 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col gap-5 relative">
              <div className="grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr] gap-5 items-stretch">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl font-semibold instrument-serif tracking-wide text-white leading-tight">
                    {combo.title}
                  </h1>
                  <p className="text-sm md:text-base text-neutral-300 max-w-xl leading-relaxed">
                    {combo.subtitle}
                  </p>
                </div>

                <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/20">
                  <OptimizedImage
                    url={combo.image}
                    type="category"
                    alt={combo.title}
                    className="h-full w-full min-h-[260px] object-cover"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {combo.packages.map((pkg, index) => {
                  const active = selectedPackageId === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`text-left rounded-[1.35rem] border p-4 transition-all duration-200 ${active ? "border-violet-400/70 bg-violet-500/05 " : "border-white/10 bg-white/[0.03] hover:border-violet-500/35 hover:bg-white/[0.05]"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-neutral-400">
                            Package {index + 1}
                          </p>
                          <h3 className="mt-1 text-lg font-semibold text-white">
                            {pkg.name}
                          </h3>
                        </div>
                        {active && (
                          <CheckCircle2
                            size={24}
                            className="text-violet-400 shrink-0 mt-1"
                          />
                        )}
                      </div>
                      <p className="mt-2 text-xl font-bold text-violet-300">
                        ₹{pkg.price.toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm text-neutral-400">
                        {pkg.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <div className="rounded-[1.4rem] border border-violet-500/25 bg-violet-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-violet-300">
                Selected package
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {selectedPackage?.name}
              </h2>
              <p className="mt-2 text-sm text-neutral-300">
                Price starts at
                <span className="ml-2 text-2xl font-bold text-violet-300 align-middle">
                  ₹{selectedPackage?.price.toLocaleString()}
                </span>
              </p>
            </div>

            <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-neutral-400">
                <CheckCircle2 size={14} className="text-violet-400" />
                Inclusions
              </div>
              <div className="mt-4 space-y-2">
                {selectedPackage?.inclusions?.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-violet-400 shrink-0" />
                    <span className="text-sm text-neutral-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">
                Add-ons
              </p>
              <div className="mt-4 space-y-2">
                {combo.addOns.map((addOn) => (
                  <label
                    key={addOn.id}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 transition-colors hover:border-violet-500/30"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAddOns.includes(addOn.id)}
                      onChange={() => toggleAddOn(addOn.id)}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-violet-500 focus:ring-violet-500"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-white">
                        {addOn.label}
                      </span>
                      <span className="block text-xs text-neutral-400">
                        {addOn.helperText}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleWhatsApp}
              className="btn-funky w-full rounded-2xl! px-0 py-4"
            >
              <span className="inline-flex items-center gap-2">
                <MessageCircle size={18} />
                Book on WhatsApp
              </span>
            </button>

            <p className="text-xs text-neutral-500 leading-relaxed">
              Choose the package, tick any extra services, and we’ll send the
              full request directly to WhatsApp.
            </p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </motion.div>
  );
};

export default BridalCombo;
