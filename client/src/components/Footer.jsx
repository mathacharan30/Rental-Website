import React from "react";
import { Link } from "react-router-dom";
import {
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
  FaFacebookF,
  FaThreads,
} from "react-icons/fa6";

const SOCIAL_LINKS = {
  instagram: "https://instagram.com",
  whatsapp: "https://wa.me/918431094754",
  youtube: "https://www.youtube.com/",
  facebook: "https://www.facebook.com/",
  threads: "https://www.threads.net/",
  infoVideo: "https://www.youtube.com/",
};

const Footer = () => {
  return (
    <>
      <div className="mt-20">
        <div className="h-px w-full bg-white/5" />
      </div>

      <footer className="bg-[#0e0e0e] pt-16 pb-8 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <h3 className="text-2xl font-semibold text-white">
                people & style
              </h3>
              <p className="mt-3 text-neutral-500 text-sm max-w-xs leading-relaxed">
                Premium clothing rentals for weddings, events, and special
                occasions. Affordable luxury, delivered to your door.
              </p>
              <div className="mt-4 flex gap-3">
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-neutral-400 hover:text-violet-400 transition-all"
                  aria-label="Instagram"
                >
                  <FaInstagram size={16} />
                </a>
                <a
                  href={SOCIAL_LINKS.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-neutral-400 hover:text-green-400 transition-all"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp size={16} />
                </a>
                <a
                  href={SOCIAL_LINKS.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-neutral-400 hover:text-red-400 transition-all"
                  aria-label="YouTube"
                >
                  <FaYoutube size={16} />
                </a>
                <a
                  href={SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-neutral-400 hover:text-blue-400 transition-all"
                  aria-label="Facebook"
                >
                  <FaFacebookF size={16} />
                </a>
                <a
                  href={SOCIAL_LINKS.threads}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-neutral-400 hover:text-white transition-all"
                  aria-label="Threads"
                >
                  <FaThreads size={16} />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 col-span-1 md:col-span-3">
              <div>
                <h4 className="font-semibold text-sm text-white mb-4 uppercase tracking-wider">
                  Company
                </h4>
                <ul className="space-y-3 text-neutral-500 text-sm">
                  <li>
                    <Link
                      to="/about"
                      className="hover:text-violet-400 transition-colors"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="hover:text-violet-400 transition-colors"
                    >
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white mb-4 uppercase tracking-wider">
                  How It Works
                </h4>
                <ul className="space-y-3 text-neutral-500 text-sm">
                  <li>
                    <Link
                      to="/products"
                      className="hover:text-violet-400 transition-colors"
                    >
                      Browse &amp; Rent
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/refund"
                      className="hover:text-violet-400 transition-colors"
                    >
                      Delivery &amp; Returns
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/faq"
                      className="hover:text-violet-400 transition-colors"
                    >
                      FAQs
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white mb-4 uppercase tracking-wider">
                  Connect
                </h4>
                <ul className="space-y-3 text-neutral-500 text-sm">
                  <li>
                    <a
                      href={SOCIAL_LINKS.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-violet-400 transition-colors"
                    >
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a
                      href={SOCIAL_LINKS.whatsapp}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-violet-400 transition-colors"
                    >
                      WhatsApp
                    </a>
                  </li>
                  <li>
                    <a
                      href={SOCIAL_LINKS.youtube}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-violet-400 transition-colors"
                    >
                      YouTube
                    </a>
                  </li>
                  <li>
                    <a
                      href={SOCIAL_LINKS.facebook}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-violet-400 transition-colors"
                    >
                      Facebook
                    </a>
                  </li>
                  <li>
                    <a
                      href={SOCIAL_LINKS.threads}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-violet-400 transition-colors"
                    >
                      Threads
                    </a>
                  </li>
                  <li>
                    <a
                      href={SOCIAL_LINKS.infoVideo}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-violet-400 transition-colors"
                    >
                      Info Video
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:hello@peopleandstyle.in"
                      className="hover:text-violet-400 transition-colors"
                    >
                      Email Us
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="py-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-600">
            <p>
              © {new Date().getFullYear()} People & Style. All rights reserved.
              &middot;
            </p>
            <div className="flex items-center gap-4 mt-3 sm:mt-0">
              <Link
                to="/privacy"
                className="hover:text-violet-400 transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="hover:text-violet-400 transition-colors"
              >
                Terms
              </Link>
              <Link
                to="/refund"
                className="hover:text-violet-400 transition-colors"
              >
                Refunds
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
