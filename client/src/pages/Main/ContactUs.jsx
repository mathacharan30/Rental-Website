// src/pages/Main/ContactUs.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const contactDetails = [
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 16.72V19a2 2 0 01-2 2H17C9.163 21 3 14.837 3 7V5z"
        />
      </svg>
    ),
    label: "Phone",
    value: "+91 91876 68280",
    href: "tel:+919187668280",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    label: "Email",
    value: "hello@peopleandstyle.in",
    href: "mailto:hello@peopleandstyle.in",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    label: "Address",
    value: "Mysuru, Karnataka, India – 570026",
    href: "https://maps.google.com/?q=Mysuru,Karnataka,India+570026",
  },
];

const ContactUs = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);
    // Compose a mailto link as the fallback (replace with backend API call if needed)
    const subject = encodeURIComponent(`Enquiry from ${form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone || "N/A"}\n\n${form.message}`,
    );
    window.location.href = `mailto:hello@peopleandstyle.in?subject=${subject}&body=${body}`;
    toast.success("Opening your email client…");
    setSending(false);
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <motion.div
      className="min-h-screen bg-[#0e0e0e]"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
    >
      {/* Header */}
      <div className="relative py-16 px-4 text-center overflow-hidden">
        <div className="relative z-10">
          <motion.h1
            variants={fadeUp}
            className="text-4xl font-bold display-font text-white"
          >
            Contact Us
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-3 text-neutral-400 max-w-md mx-auto text-sm"
          >
            Have a question, need styling advice, or want to know about a
            specific outfit? We'd love to hear from you.
          </motion.p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Details */}
        <div>
          <motion.h2
            variants={fadeUp}
            className="text-2xl font-bold display-font text-white mb-8"
          >
            Reach us directly
          </motion.h2>
          <div className="space-y-5">
            {contactDetails.map((item, i) => (
              <motion.a
                key={item.label}
                custom={i}
                variants={fadeUp}
                href={item.href}
                target={item.label === "Address" ? "_blank" : undefined}
                rel="noreferrer"
                className="flex items-start gap-4 glass rounded-2xl p-5 hover:border-violet-500/30 transition-all duration-300 group"
              >
                <span className="text-violet-400 mt-0.5 group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <div>
                  <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wide">
                    {item.label}
                  </p>
                  <p className="text-white font-medium mt-0.5">{item.value}</p>
                </div>
              </motion.a>
            ))}
          </div>

          {/* WhatsApp CTA */}
          <motion.a
            variants={fadeUp}
            href="https://wa.me/918431094754"
            target="_blank"
            rel="noreferrer"
            className="mt-6 flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat on WhatsApp
          </motion.a>

          {/* Business Hours */}
          <motion.div variants={fadeUp} className="mt-8 glass rounded-2xl p-5">
            <h3 className="font-bold text-white mb-3">Business Hours</h3>
            <ul className="text-sm text-neutral-400 space-y-1">
              <li className="flex justify-between">
                <span>Monday – Saturday</span>
                <span className="font-medium text-white">
                  10:00 AM – 7:00 PM
                </span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span className="font-medium text-white">
                  11:00 AM – 5:00 PM
                </span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Contact Form */}
        <motion.div variants={fadeUp} className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold display-font text-white mb-6">
            Send us a message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                placeholder="Tell us about the outfit you're looking for, your event date, or any other question…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full btn-funky rounded-xl! disabled:opacity-60"
            >
              <span>{sending ? "Sending…" : "Send Message →"}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ContactUs;
