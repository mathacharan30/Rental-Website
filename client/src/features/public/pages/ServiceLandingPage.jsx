import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import Footer from "../../shared/components/Footer";
import { servicePages } from "../../../data/serviceLandingData";
import ProductCard from "../components/ProductCard";
import PackageTile from "../components/makeup/PackageTile";
import { bridalComboPackages } from "../../../data/combos";
import {
  getAllProducts,
  getProductsByCategorySlug,
} from "../../../services/productService";
import { getAllMakeupPackages } from "../../../services/makeupPackageService";

const WA_NUMBER = "919187668280";

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 md:p-5 text-left text-white hover:bg-white/5 transition-colors"
        aria-expanded={open}
      >
        <span className="font-medium text-sm md:text-base pr-4">{q}</span>
        {open ? (
          <ChevronUp size={18} className="text-violet-400 shrink-0" />
        ) : (
          <ChevronDown size={18} className="text-neutral-500 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 md:px-5 pb-4 text-neutral-400 text-sm leading-relaxed border-t border-white/5">
          {a}
        </div>
      )}
    </div>
  );
};

/* ── Bridal combo card ───────────────────────────────────────────── */
const BridalComboCard = ({ pkg, waText }) => {
  const img = pkg.gallery?.[0]?.src;
  return (
    <a
      href={waText}
      target="_blank"
      rel="noreferrer"
      className="group relative w-42 md:w-56 overflow-hidden rounded-3xl border-b-2 border-white/8 bg-white/2 backdrop-blur-md shadow-inner shadow-white/24 hover:bg-white/5 transition-all duration-500 mb-6 block p-2.5"
    >
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-linear-to-r from-transparent via-white/15 to-transparent pointer-events-none z-20" />
      <div className="relative h-60 md:h-74 overflow-hidden rounded-2xl bg-neutral-950/50">
        {img ? (
          <img
            src={img}
            alt={pkg.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-white/5" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
      </div>
      <div className="pt-2 px-1 pb-0.5">
        <p className="text-[8px] tracking-wider uppercase text-violet-400 font-semibold opacity-90">
          Bridal Package
        </p>
        <h3 className="mt-0.5 text-sm font-semibold text-white/95 line-clamp-1 group-hover:text-violet-200 transition-colors duration-300">
          {pkg.name}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-bold text-violet-300">
            ₹{pkg.price.toLocaleString()}
          </span>
          <span className="text-[10px] text-white/30 group-hover:text-violet-400 transition-colors font-medium">
            Enquire <ArrowRight className="inline-block w-4 h-4" />
          </span>
        </div>
      </div>
    </a>
  );
};

const ServiceLandingPage = () => {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\//, "");
  const data = servicePages[slug];
  if (!data) return null;

  const pf = data.productFilter;

  const waEnquiryText = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Hi, I saw your ${data.service} on People & Style. I'm interested in renting for my event in ${data.city}. Can you help me?`
  )}`;

  /* ── Fetch based on filter type ─────────────────────────────── */
  const { data: fetchedItems = [] } = useQuery({
    queryKey: ["service-landing-items", slug],
    queryFn: async () => {
      if (!pf) return [];
      if (pf.type === "category") {
        const result = await getProductsByCategorySlug(pf.slug, 1, pf.limit);
        return result.products || [];
      }
      if (pf.type === "all") {
        const all = await getAllProducts();
        return all.slice(0, pf.limit);
      }
      if (pf.type === "makeup") {
        const all = await getAllMakeupPackages();
        return all.slice(0, pf.limit);
      }
      return [];
    },
    enabled: !!pf && pf.type !== "bridal-combo",
    staleTime: 1000 * 60 * 5,
  });

  const isBridalCombo = pf?.type === "bridal-combo";
  const isMakeup = pf?.type === "makeup";
  const isProduct = pf?.type === "all" || pf?.type === "category";
  const hasVisuals = isBridalCombo || (fetchedItems.length > 0);

  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white">

      {/* ── Hero (title only) ────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 pt-14 pb-8">
        <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-3">
          People & Style · {data.city}
        </p>
        <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight">
          {data.h1}
        </h1>
      </section>

      {/* ── Visual grid (shown first) ─────────────────────────────────── */}
      {pf && (
        <>
          <section className="max-w-5xl mx-auto px-4 pb-6">

            {/* Rental products (clothing / jewellery) */}
            {isProduct && (
              fetchedItems.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                    {fetchedItems.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-8">
                    <a
                      href={waEnquiryText}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-funky inline-flex items-center justify-center"
                    >
                      Enquire on WhatsApp
                    </a>
                    <Link
                      to={data.ctaLink}
                      className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                      View All →
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="w-42 md:w-56 rounded-3xl bg-white/5 animate-pulse" style={{ height: 300 }} />
                  ))}
                </div>
              )
            )}

            {/* Bridal combo packages */}
            {isBridalCombo && (
              <>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  {bridalComboPackages.map((pkg) => (
                    <BridalComboCard
                      key={pkg.id}
                      pkg={pkg}
                      waText={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                        `Hi, I'm interested in the ${pkg.name} package (₹${pkg.price.toLocaleString()}) for my event in ${data.city}. Can you share availability?`
                      )}`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 mt-8">
                  <a
                    href={waEnquiryText}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-funky inline-flex items-center justify-center"
                  >
                    Enquire on WhatsApp
                  </a>
                  <Link
                    to={data.ctaLink}
                    className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>
              </>
            )}

            {/* Makeup packages */}
            {isMakeup && (
              fetchedItems.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                    {fetchedItems.map((pkg) => (
                      <PackageTile
                        key={pkg._id}
                        pkg={pkg}
                        onClick={() => {
                          window.open(
                            `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                              `Hi, I'm interested in the ${pkg.name} makeup package for my event in ${data.city}. Can you share pricing and availability?`
                            )}`,
                            "_blank"
                          );
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-8">
                    <a
                      href={waEnquiryText}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-funky inline-flex items-center justify-center"
                    >
                      Enquire on WhatsApp
                    </a>
                    <Link
                      to="/contact"
                      className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                      Book a Consultation
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="w-42 md:w-56 rounded-3xl bg-white/5 animate-pulse" style={{ height: 300 }} />
                  ))}
                </div>
              )
            )}
          </section>
          <div className="h-px w-full bg-white/5" />
        </>
      )}

      {/* ── Intro paragraphs ─────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="space-y-4">
          {data.introParagraphs.map((para, i) => (
            <p key={i} className="text-neutral-400 text-base md:text-lg leading-relaxed">
              {para}
            </p>
          ))}
        </div>

        {/* CTA for service-only pages with no visuals */}
        {!pf && (
          <div className="flex flex-wrap gap-3 mt-8">
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                `Hi, I'm interested in ${data.service} for my event in ${data.city}. Can you share pricing and availability?`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn-funky inline-flex items-center justify-center"
            >
              Enquire on WhatsApp
            </a>
            <Link
              to="/contact"
              className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors text-sm font-medium"
            >
              Contact Us
            </Link>
          </div>
        )}
      </section>

      <div className="h-px w-full bg-white/5" />

      {/* ── Highlights ───────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl md:text-2xl font-semibold mb-8">Why choose People & Style?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data.highlights.map((item, i) => (
            <div key={i} className="glass rounded-xl p-5 border border-white/10">
              <span className="text-2xl" role="img" aria-hidden="true">{item.icon}</span>
              <p className="text-white font-medium text-sm mt-3 mb-1">{item.label}</p>
              <p className="text-neutral-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px w-full bg-white/5" />

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-xl md:text-2xl font-semibold mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {data.faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      <div className="h-px w-full bg-white/5" />

      {/* ── Related links ────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-4">
          Our Other Services
        </p>
        <div className="flex flex-wrap gap-3">
          {data.relatedLinks.map((link, i) => (
            <Link
              key={i}
              to={link.to}
              className="px-4 py-2 rounded-full border border-white/10 text-neutral-300 hover:text-violet-400 hover:border-violet-500/40 transition-colors text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServiceLandingPage;
