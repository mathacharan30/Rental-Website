import React from "react";
import { Link } from "react-router-dom";
import {
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa6";

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/peopleandstyle.in",
  whatsapp: "https://wa.me/message/FRASHXI7BJGSG1",
  youtube: "https://youtube.com/@peopleandstyle_in",
};

const Footer = () => {
  return (
    <>
      <div className="mt-20">
        <div className="h-px w-full bg-white/5" />
      </div>

      <footer className="bg-[#191919] pt-16 pb-8 text-black relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <h3 className="text-2xl font-medium text-white instrument-serif tracking-wider">
                People & style
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
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-neutral-400 hover:text-violet-400 transition-colors duration-150"
                  aria-label="Instagram"
                >
                  <FaInstagram size={16} />
                </a>
                <a
                  href={SOCIAL_LINKS.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-neutral-400 hover:text-green-400 transition-colors duration-150"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp size={16} />
                </a>
                <a
                  href={SOCIAL_LINKS.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-neutral-400 hover:text-red-400 transition-colors duration-150"
                  aria-label="YouTube"
                >
                  <FaYoutube size={16} />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 col-span-1 md:col-span-3">
              <div>
                <h4 className="font-semibold text-sm text-white mb-4 uppercase tracking-wider">
                  Services — Mysuru
                </h4>
                <ul className="space-y-3 text-neutral-500 text-sm">
                  <li>
                    <Link to="/rental-clothing-mysuru" className="hover:text-violet-400 transition-colors">
                      Rental Clothing
                    </Link>
                  </li>
                  <li>
                    <Link to="/rental-jewellery-mysuru" className="hover:text-violet-400 transition-colors">
                      Rental Jewellery
                    </Link>
                  </li>
                  <li>
                    <Link to="/makeup-services-mysuru" className="hover:text-violet-400 transition-colors">
                      Bridal Makeup
                    </Link>
                  </li>
                  <li>
                    <Link to="/photography-services-mysuru" className="hover:text-violet-400 transition-colors">
                      Photography
                    </Link>
                  </li>
                  <li>
                    <Link to="/bridal-package-mysuru" className="hover:text-violet-400 transition-colors">
                      Bridal Package
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white mb-4 uppercase tracking-wider">
                  Services — Bangalore
                </h4>
                <ul className="space-y-3 text-neutral-500 text-sm">
                  <li>
                    <Link to="/rental-clothing-bangalore" className="hover:text-violet-400 transition-colors">
                      Rental Clothing
                    </Link>
                  </li>
                  <li>
                    <Link to="/rental-jewellery-bangalore" className="hover:text-violet-400 transition-colors">
                      Rental Jewellery
                    </Link>
                  </li>
                  <li>
                    <Link to="/makeup-services-bangalore" className="hover:text-violet-400 transition-colors">
                      Bridal Makeup
                    </Link>
                  </li>
                  <li>
                    <Link to="/photography-services-bangalore" className="hover:text-violet-400 transition-colors">
                      Photography
                    </Link>
                  </li>
                  <li>
                    <Link to="/bridal-package-bangalore" className="hover:text-violet-400 transition-colors">
                      Bridal Package
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white mb-4 uppercase tracking-wider">
                  Company
                </h4>
                <ul className="space-y-3 text-neutral-500 text-sm">
                  <li>
                    <Link to="/about" className="hover:text-violet-400 transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="hover:text-violet-400 transition-colors">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/products" className="hover:text-violet-400 transition-colors">
                      Browse &amp; Rent
                    </Link>
                  </li>
                  <li>
                    <Link to="/faq" className="hover:text-violet-400 transition-colors">
                      FAQs
                    </Link>
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
