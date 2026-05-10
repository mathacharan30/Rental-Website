import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  ChevronDown,
  CheckIcon,
  Plus,
} from "lucide-react";
import Footer from "../../shared/components/Footer";
import OptimizedImage from "../../shared/components/OptimizedImage";
import { comboCategories } from "../../../data/combos";
import { openWhatsApp } from "../../../services/whatsapp";

const cardMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
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
  const [showTerms, setShowTerms] = useState(false);

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

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-3 pb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-violet-400 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>

      <motion.div
        className="max-w-7xl mx-auto px-4 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold instrument-serif tracking-wide text-white leading-tight mb-3">
                {combo.title}
              </h1>
              <p className="text-sm md:text-base text-neutral-400 leading-relaxed max-w-lg">
                {combo.subtitle}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <motion.div
          className="mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            Choose Your Package
          </h2>
          <div className="flex flex-row overflow-x-scroll gap-3">
            {combo.packages.map((pkg, index) => {
              const active = selectedPackageId === pkg.id;
              return (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={`text-left rounded-[1.35rem] border min-w-[80vw] md:min-w-auto p-4 transition-all duration-200 ${
                    active
                      ? "border-violet-400/70 bg-violet-500/05"
                      : "border-white/10 bg-white/[0.03] hover:border-violet-500/35 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.22em] text-neutral-400">
                        Package {index + 1}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-white">
                        {pkg.name}
                      </h3>
                    </div>
                    {active && (
                      <CheckIcon
                        size={20}
                        className="text-violet-400 font-bold mt-1"
                      />
                    )}
                  </div>
                  <p className="mt-2 text-xl font-bold text-violet-300">
                    ₹{pkg.price.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
                    {pkg.description}
                  </p>
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="lg:col-span-2 space-y-5">
            <div className="p-2">
              <div className="flex items-center gap-2 mb-4">
                <CheckIcon size={24} className="text-violet-400" />
                <h3 className="text-sm font-semibold uppercase text-white">
                  What's Included
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedPackage?.inclusions?.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5"
                  >
                    <span className="h-2 w-2 rounded-full bg-violet-400 shrink-0" />
                    <span className="text-sm text-neutral-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className=" p-2">
              <h3 className="text-sm flex flex-row items-center gap-3 font-semibold uppercase text-white mb-4">
                <Plus size={24} className="text-violet-400" /> Add Optional
                Services
              </h3>
              <div className="space-y-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {combo.addOns.map((addOn) => (
                  <label
                    key={addOn.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-3 transition-all hover:border-violet-500/40 hover:bg-white/[0.05]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAddOns.includes(addOn.id)}
                      onChange={() => toggleAddOn(addOn.id)}
                      className="mt-1.5 h-4 w-4 rounded border-white/20 bg-transparent text-violet-500 focus:ring-violet-500"
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-white">
                        {addOn.label}
                      </span>
                      <span className="block text-xs text-neutral-400 mt-0.5">
                        {addOn.helperText}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[1.4rem] border border-violet-500/30 bg-gradient-to-br from-violet-500/15 to-violet-500/5 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-violet-300 mb-2">
                Your Selection
              </p>
              <h2 className="text-2xl font-semibold text-white mb-3">
                {selectedPackage?.name}
              </h2>
              <div className="space-y-2 mb-4 pb-4 border-b border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Package Price</span>
                  <span className="text-white font-semibold">
                    ₹{selectedPackage?.price.toLocaleString()}
                  </span>
                </div>
                {selectedAddOns.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs text-neutral-400 mb-2">
                      Selected Add-ons ({selectedAddOns.length}):
                    </p>
                    <div className="space-y-1">
                      {selectedAddOns.map((addOnId) => {
                        const addOn = combo.addOns.find(
                          (a) => a.id === addOnId,
                        );
                        return (
                          <p
                            key={addOnId}
                            className="text-xs text-violet-300 flex items-center gap-2"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                            {addOn?.label}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleWhatsApp}
                className="btn-funky w-full rounded-xl px-0 py-3 text-sm"
              >
                <span className="inline-flex items-center gap-2">
                  <MessageCircle size={16} />
                  Book on WhatsApp
                </span>
              </button>
            </div>

            {combo.termsAndConditions && (
              <div className="rounded-[1.4rem] border border-white/10 bg-black/20 overflow-hidden">
                <button
                  onClick={() => setShowTerms(!showTerms)}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/[0.05] transition-colors"
                >
                  <h3 className="text-sm font-semibold uppercase text-white">
                    Terms & Conditions
                  </h3>
                  <ChevronDown
                    size={16}
                    className={`text-neutral-400 transition-transform ${
                      showTerms ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showTerms && (
                  <div className="px-5 py-4 pb-5 border-t border-white/10 space-y-4 text-xs text-neutral-300">
                    <div>
                      <h4 className="text-sm font-semibold text-violet-300 mb-2">
                        What's Included
                      </h4>
                      <ul className="space-y-1">
                        {combo.termsAndConditions.whatsIncluded?.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="text-violet-400 shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {combo.termsAndConditions.travelPolicy && (
                      <div>
                        <h4 className="text-sm font-semibold text-violet-300 mb-2">
                          Travel Policy
                        </h4>
                        <p>{combo.termsAndConditions.travelPolicy}</p>
                      </div>
                    )}

                    {combo.termsAndConditions.bookingDetails && (
                      <div>
                        <h4 className="text-sm font-semibold text-violet-300 mb-2">
                          Booking Details
                        </h4>
                        <ul className="space-y-1">
                          <li className="flex gap-2">
                            <span className="text-violet-400 shrink-0">•</span>
                            <span>
                              Advance Payment:{" "}
                              {
                                combo.termsAndConditions.bookingDetails
                                  .advancePayment
                              }
                            </span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-violet-400 shrink-0">•</span>
                            <span>
                              Remaining:{" "}
                              {
                                combo.termsAndConditions.bookingDetails
                                  .remainingPayment
                              }
                            </span>
                          </li>
                        </ul>
                      </div>
                    )}

                    {combo.termsAndConditions.cancellationPolicy && (
                      <div>
                        <h4 className="text-sm font-semibold text-violet-300 mb-2">
                          Cancellation Policy
                        </h4>
                        <p>{combo.termsAndConditions.cancellationPolicy}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {selectedPackage?.gallery && selectedPackage.gallery.length > 0 && (
          <motion.div
            className="mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-semibold instrument-serif text-white mb-2">
                {selectedPackage.name} Gallery
              </h2>
              <p className="text-neutral-400 text-sm">
                See what you can expect from this package tier
              </p>
            </div>

            <div
              className="grid gap-4 auto-rows-max"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              }}
            >
              {selectedPackage.gallery.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="overflow-hidden rounded-[1.35rem] "
                >
                  <div className="relative overflow-hidden bg-black/20 aspect-auto">
                    <OptimizedImage
                      url={image.src}
                      type="gallery"
                      alt={image.alt}
                      className="w-full h-full rounded-[1.35rem]  object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </motion.div>
  );
};

export default BridalCombo;
