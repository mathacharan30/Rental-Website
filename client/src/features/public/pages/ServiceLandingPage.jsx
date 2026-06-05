import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import Footer from "../../shared/components/Footer";
import { servicePages } from "../../../data/serviceLandingData";

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

const ServiceLandingPage = () => {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\//, '');
  const data = servicePages[slug];
  if (!data) return null;
  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 pt-14 pb-12">
        <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-3">
          People & Style · {data.city}
        </p>
        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6 tracking-tight">
          {data.h1}
        </h1>
        <div className="space-y-4">
          {data.introParagraphs.map((para, i) => (
            <p
              key={i}
              className="text-neutral-400 text-base md:text-lg leading-relaxed"
            >
              {para}
            </p>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link
            to={data.ctaLink}
            className="btn-funky inline-flex items-center justify-center"
          >
            {data.ctaText}
          </Link>
          <a
            href="https://wa.me/message/FRASHXI7BJGSG1"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors text-sm font-medium"
          >
            Chat on WhatsApp
          </a>
        </div>
      </section>

      <div className="h-px w-full bg-white/5" />

      {/* ── Highlights ───────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl md:text-2xl font-semibold mb-8">
          Why choose People & Style?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data.highlights.map((item, i) => (
            <div
              key={i}
              className="glass rounded-xl p-5 border border-white/10"
            >
              <span className="text-2xl" role="img" aria-hidden="true">
                {item.icon}
              </span>
              <p className="text-white font-medium text-sm mt-3 mb-1">
                {item.label}
              </p>
              <p className="text-neutral-500 text-xs leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px w-full bg-white/5" />

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-xl md:text-2xl font-semibold mb-8">
          Frequently Asked Questions
        </h2>
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
