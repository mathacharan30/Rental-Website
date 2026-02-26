// src/pages/Main/AboutUs.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const values = [
  {
    icon: "♻️",
    title: "Sustainable Fashion",
    desc: "Every rental reduces textile waste. We believe looking good should never cost the planet.",
  },
  {
    icon: "✨",
    title: "Curated Designer Wear",
    desc: "Hand-picked ethnic and contemporary pieces for weddings, parties, and every celebration in between.",
  },
  {
    icon: "🚚",
    title: "Doorstep Delivery",
    desc: "Fresh, cleaned, and ready-to-wear outfits delivered right to your door in Mysuru and beyond.",
  },
  {
    icon: "💰",
    title: "Affordable Luxury",
    desc: "Wear ₹20,000 outfits for a fraction of the price — no EMIs, no storage, no dry-cleaning bills.",
  },
];

// const team = [{ name: "Founder", role: "People & Style", initials: "P&S" }];

const AboutUs = () => (
  <motion.div
    className="min-h-screen bg-[#0e0e0e]"
    initial="hidden"
    animate="visible"
    variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
  >
    {/* Hero */}
    <section className="relative py-24 px-4 text-center overflow-hidden">
      <div className="relative z-10">
        <motion.h1
          variants={fadeUp}
          className="text-4xl md:text-6xl font-bold display-font max-w-3xl mx-auto leading-tight text-white"
        >
          Rent. Wear. <span className="gradient-text">Return.</span>
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-6 text-neutral-400 max-w-xl mx-auto text-lg leading-relaxed"
        >
          People & Style is Mysuru's premier cloth-rental service — making
          designer fashion accessible, affordable, and sustainable for every
          occasion.
        </motion.p>
      </div>
    </section>

    {/* Mission */}
    <section className="max-w-4xl mx-auto px-4 py-16 text-center">
      <motion.h2
        variants={fadeUp}
        className="text-3xl font-bold display-font text-white mb-6"
      >
        Why we started
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="text-neutral-400 text-lg leading-relaxed"
      >
        Fashion in India means celebrations — and celebrations mean new outfits.
        But buying an outfit worn once creates mountains of textile waste and
        drains wallets. We started{" "}
        <strong className="text-white">People & Style</strong> in Mysuru,
        Karnataka to change that. We curate a rotating wardrobe of stunning
        ethnic and contemporary wear so you always show up dressed to impress —
        without the guilt or the guilt-trip from your bank account.
      </motion.p>
    </section>

    {/* Values */}
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          variants={fadeUp}
          className="text-3xl font-bold display-font text-center mb-12 text-white"
        >
          What we stand for
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              custom={i}
              variants={fadeUp}
              className="glass rounded-2xl p-6 text-center hover:border-violet-500/30 transition-all duration-300"
            >
              <span className="text-4xl">{v.icon}</span>
              <h3 className="mt-4 font-bold text-lg text-white">{v.title}</h3>
              <p className="mt-2 text-neutral-500 text-sm leading-relaxed">
                {v.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="max-w-4xl mx-auto px-4 py-16">
      <motion.h2
        variants={fadeUp}
        className="text-3xl font-bold display-font text-center mb-12 text-white"
      >
        How it works
      </motion.h2>
      <div className="space-y-6">
        {[
          {
            step: "01",
            title: "Browse & Select",
            desc: "Explore our curated collection online. Filter by occasion, size, or colour.",
          },
          {
            step: "02",
            title: "Place Your Order",
            desc: "Pick your rental dates and place your order. We handle cleaning and packaging.",
          },
          {
            step: "03",
            title: "Wear & Shine",
            desc: "Receive your outfit at your doorstep, fresh and ready. Look incredible at your event.",
          },
          {
            step: "04",
            title: "Return with Ease",
            desc: "Drop it back after your event. No dry-cleaning needed — we take care of everything.",
          },
        ].map((s, i) => (
          <motion.div
            key={s.step}
            custom={i}
            variants={fadeUp}
            className="flex gap-6 items-start glass rounded-2xl p-6 hover:border-violet-500/30 transition-all duration-300"
          >
            <span className="text-3xl font-black gradient-text min-w-12">
              {s.step}
            </span>
            <div>
              <h3 className="font-bold text-lg text-white">{s.title}</h3>
              <p className="text-neutral-500 text-sm mt-1">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>

    <section className="py-20 px-4 text-center">
      <div>
        <motion.h2
          variants={fadeUp}
          className="text-3xl font-bold display-font text-white mb-4"
        >
          Ready to look your best?
        </motion.h2>
        <motion.p variants={fadeUp} className="text-neutral-400 mb-8">
          Browse hundreds of outfits for your next event.
        </motion.p>
        <motion.div variants={fadeUp}>
          <Link to="/products" className="btn-funky">
            <span>Explore Collection</span>
          </Link>
        </motion.div>
      </div>
    </section>
  </motion.div>
);

export default AboutUs;
