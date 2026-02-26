// src/pages/Main/FAQ.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const faqs = [
  // ── How renting works ──────────────────────────────────────────────────
  {
    category: "How Renting Works",
    items: [
      {
        q: "How does the rental process work?",
        a: (
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Browse &amp; Select</strong> — Find the outfit you love
              and choose your event date.
            </li>
            <li>
              <strong>Pay Advance + Rental Amount</strong> — At checkout you pay
              the <em>rental fee</em> plus a{" "}
              <em>refundable security deposit (advance)</em>.
            </li>
            <li>
              <strong>Delivery to Your Door</strong> — We clean, pack, and
              deliver the outfit to your address before your event.
            </li>
            <li>
              <strong>Wear &amp; Enjoy</strong> — Look stunning at your event!
            </li>
            <li>
              <strong>We Pick It Up</strong> — Once your rental period ends, we
              schedule a pickup from your location.
            </li>
            <li>
              <strong>Advance Returned</strong> — After the garment passes
              inspection, your full security deposit is refunded within 3–5
              business days.
            </li>
          </ol>
        ),
      },
      {
        q: "What is the security deposit (advance)?",
        a: "The advance is a refundable deposit collected to cover any potential damage or loss. It is separate from the rental fee. Once we receive the garment back in good condition, the full advance is returned to you within 3–5 business days via the original payment method.",
      },
      {
        q: "When will I receive my order?",
        a: "We deliver your outfit 1 day before your specified event date so you have time to try it on. Delivery timelines may vary by location. You will receive a confirmation message with your delivery window.",
      },
      {
        q: "How is the pickup scheduled?",
        a: "After your event, we will contact you to schedule a convenient pickup time. Please keep the outfit ready in the original packaging provided. Pickup is usually within 1–2 days after the rental period ends.",
      },
    ],
  },

  // ── Payments ────────────────────────────────────────────────────────────
  {
    category: "Payments & Advance",
    items: [
      {
        q: "What do I pay at the time of booking?",
        a: "You pay two amounts at checkout: (1) the Rental Fee — the cost of renting the outfit for your chosen period, and (2) a Security Deposit (Advance) — a fully refundable amount held as a guarantee against damage or loss.",
      },
      {
        q: "How and when is the advance refunded?",
        a: "Once we pick up the garment and our team inspects it, the full advance is refunded to your original payment method within 3–5 business days — provided the outfit is returned in good condition with no stains, tears, or missing accessories.",
      },
      {
        q: "Will any amount be deducted from my advance?",
        a: "Yes, deductions may apply in the following cases:\n• Visible stains that cannot be removed by professional cleaning.\n• Tears, burns, cuts, or structural damage to the garment.\n• Missing buttons, embellishments, or accessories.\n• Damage beyond normal wear.\nThe deduction amount depends on the severity of the damage. In the case of total loss or irreparable damage, the full advance (or more) may be charged as a replacement cost.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We accept UPI, debit/credit cards, net banking, and popular wallets via our secure payment gateway. Cash on delivery is not available.",
      },
    ],
  },

  // ── Damage & Returns ────────────────────────────────────────────────────
  {
    category: "Damage, Stains & Returns",
    items: [
      {
        q: "What counts as normal wear vs. damage?",
        a: (
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-green-400">
                ✅ Normal wear (no deduction):
              </p>
              <ul className="list-disc pl-5 space-y-1 text-neutral-400">
                <li>Light, superficial creases from wearing.</li>
                <li>Very minor, barely-visible surface dust.</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-red-400">
                ❌ Damage (advance deducted):
              </p>
              <ul className="list-disc pl-5 space-y-1 text-neutral-400">
                <li>
                  Food, beverage, makeup, or oil stains that require special
                  treatment.
                </li>
                <li>Tears, rips, burns, or cuts to the fabric.</li>
                <li>Missing embellishments, buttons, or dupatta.</li>
                <li>
                  Alterations, stitching, or dyeing done without permission.
                </li>
              </ul>
            </div>
          </div>
        ),
      },
      {
        q: "Do I need to dry-clean the outfit before returning?",
        a: "No! Please do NOT dry-clean or wash the outfit yourself. Simply fold it neatly and place it back in the original packaging. We handle all professional cleaning after every rental.",
      },
      {
        q: "What if the outfit arrives damaged or stained?",
        a: "Every garment is inspected and cleaned before dispatch. If you notice any damage upon arrival, photograph it immediately and contact us within 2 hours of delivery at hello@peopleandstyle.in or +91 84310 94754. We will arrange a replacement or issue a refund.",
      },
      {
        q: "What if I lose the outfit?",
        a: "In the event of loss or theft, you will be charged the full replacement cost of the garment, which may exceed the security deposit amount. The exact cost depends on the retail value of the item.",
      },
    ],
  },

  // ── Sizing & Styling ────────────────────────────────────────────────────
  {
    category: "Sizing & Styling",
    items: [
      {
        q: "How do I know if the outfit will fit me?",
        a: "Each product listing includes detailed size measurements (bust, waist, hip, length). We recommend measuring yourself and comparing with the size chart before ordering. If you are between sizes, feel free to contact us for guidance.",
      },
      {
        q: "Can I alter the outfit to fit me better?",
        a: "No. Alterations — including stitching, pinning, or any modification — are strictly not permitted. Damage caused by alterations will result in deductions from your advance.",
      },
      {
        q: "Can I rent an outfit for multiple days?",
        a: "Yes! Select your desired rental duration at checkout. Extended rentals are priced accordingly. Contact us for custom durations not listed on the product page.",
      },
    ],
  },

  // ── Orders & Cancellations ──────────────────────────────────────────────
  {
    category: "Orders & Cancellations",
    items: [
      {
        q: "Can I cancel my order?",
        a: (
          <div className="space-y-2">
            <p>Yes, you can cancel before dispatch. Our cancellation policy:</p>
            <div className="space-y-1.5">
              {[
                {
                  when: "7+ days before delivery",
                  refund: "100% refund",
                  color: "text-green-400 bg-green-500/10 border-green-500/20",
                },
                {
                  when: "3–6 days before delivery",
                  refund: "50% refund",
                  color:
                    "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
                },
                {
                  when: "1–2 days before delivery",
                  refund: "25% refund",
                  color:
                    "text-orange-400 bg-orange-500/10 border-orange-500/20",
                },
                {
                  when: "Same day / after dispatch",
                  refund: "No refund",
                  color: "text-red-400 bg-red-500/10 border-red-500/20",
                },
              ].map((r) => (
                <div
                  key={r.when}
                  className={`flex justify-between border rounded-lg px-4 py-2 text-sm ${r.color}`}
                >
                  <span>{r.when}</span>
                  <span className="font-semibold">{r.refund}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-neutral-500">
              See our full{" "}
              <Link to="/refund" className="text-violet-400 hover:underline">
                Refund Policy
              </Link>{" "}
              for details.
            </p>
          </div>
        ),
      },
      {
        q: "Can I change the date of my rental?",
        a: "Date changes are subject to product availability. Please contact us at least 4 days before your original delivery date to request a change. We will do our best to accommodate you.",
      },
      {
        q: "What if I want to extend my rental period?",
        a: "Contact us before your scheduled pickup date to request an extension. Extensions are subject to availability and will be charged at the daily rental rate. Returning late without prior approval may result in a late fee deducted from your advance.",
      },
    ],
  },

  // ── General ─────────────────────────────────────────────────────────────
  {
    category: "General",
    items: [
      {
        q: "Do you deliver outside Mysuru?",
        a: "We are based in Mysuru, Karnataka and currently deliver across Mysuru city. We are working on expanding to other cities. For outstation deliveries, please contact us directly and we will try to accommodate your request.",
      },
      {
        q: "How do I contact you for help?",
        a: (
          <ul className="space-y-1">
            <li>
              📞{" "}
              <a
                href="tel:+918431094754"
                className="text-violet-400 hover:underline"
              >
                +91 84310 94754
              </a>
            </li>
            <li>
              📧{" "}
              <a
                href="mailto:hello@peopleandstyle.in"
                className="text-violet-400 hover:underline"
              >
                hello@peopleandstyle.in
              </a>
            </li>
            <li>
              💬{" "}
              <a
                href="https://wa.me/918431094754"
                target="_blank"
                rel="noreferrer"
                className="text-violet-400 hover:underline"
              >
                WhatsApp us
              </a>
            </li>
            <li>🕐 Mon–Sat: 10 AM – 7 PM | Sun: 11 AM – 5 PM</li>
          </ul>
        ),
      },
    ],
  },
];

const AccordionItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-5 text-left gap-4 group"
      >
        <span className="font-semibold text-white group-hover:text-violet-400 transition text-sm md:text-base">
          {q}
        </span>
        <span
          className={`text-xl font-light text-neutral-500 shrink-0 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-neutral-400 text-sm leading-relaxed">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState(faqs[0].category);

  return (
    <motion.div
      className="min-h-screen bg-[#0e0e0e]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="py-16 px-4 text-center">
        <div>
          <h1 className="text-4xl font-bold display-font text-white">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-neutral-400 max-w-lg mx-auto text-sm">
            Everything you need to know about renting from People &amp; Style —
            from placing your order to getting your advance back.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Sidebar — category nav */}
        <aside className="md:col-span-1">
          <nav className="sticky top-6 space-y-1">
            {faqs.map((group) => (
              <button
                key={group.category}
                onClick={() => setActiveCategory(group.category)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeCategory === group.category
                    ? "bg-violet-600 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {group.category}
              </button>
            ))}
          </nav>
        </aside>

        {/* FAQ accordion */}
        <div className="md:col-span-3">
          {faqs
            .filter((g) => g.category === activeCategory)
            .map((group) => (
              <div key={group.category} className="glass rounded-2xl px-6 py-2">
                <h2 className="text-lg font-bold display-font text-white py-5 border-b border-white/5">
                  {group.category}
                </h2>
                {group.items.map((item) => (
                  <AccordionItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            ))}
        </div>
      </div>

      {/* Still have questions CTA */}
      <div className="relative py-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-violet-500/10 via-transparent to-transparent" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold display-font text-white mb-2">
            Still have questions?
          </h2>
          <p className="text-neutral-400 text-sm mb-6">
            Our team is happy to help. Reach out anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contact" className="btn-funky">
              <span>Contact Us →</span>
            </Link>
            <a
              href="https://wa.me/918431094754"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-full transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FAQ;
