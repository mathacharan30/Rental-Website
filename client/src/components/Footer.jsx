import React from "react";

const Footer = () => {
  return (
    <>
      <div className="flex flex-col gap-1 md:mt-18 mt-12  items-center">
        <div className="h-2 w-[61%] bg-black  opacity-5 rounded-t-xl"></div>
        <div className="h-2 w-[72%] bg-black  opacity-15 rounded-t-xl"></div>
        <div className="h-2 w-[84%] bg-black  opacity-55 rounded-t-xl"></div>
        <div className="h-2 w-[92%] bg-black opacity-75 rounded-t-xl"></div>
      </div>
      <footer className="  bg-black flex flex-col rounded-t-2xl mt-1 text-base-off-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
            <div className="md:col-span-1">
              <h3 className="text-2xl font-display flex items-end font-bold text-pink-700">
                People & Style
              </h3>
              <p className="mt-2 text-neutral-400 max-w-xs">
                Sustainable style, delivered. Rent designer wear for every
                occasion.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 col-span-1 md:col-span-3">
              <div>
                <h4 className="font-semibold text-neutral-100">Company</h4>
                <ul className="mt-4 space-y-2 text-neutral-400">
                  <li>
                    <a href="#" className="hover:text-pink-900">
                      About
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-100">How It Works</h4>
                <ul className="mt-4 space-y-2 text-neutral-400">
                  <li>
                    <a href="#" className="hover:text-pink-900">
                      Browse & Rent
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-pink-900">
                      Delivery & Returns
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-pink-900">
                      FAQs
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-100">Connect</h4>
                <ul className="mt-4 space-y-2 text-neutral-400">
                  <li>
                    <a href="#" className="hover:text-pink-900">
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-pink-900">
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="py-6 border-t border-neutral-700 flex flex-col sm:flex-row justify-between items-center text-sm text-neutral-500">
            <p>© {new Date().getFullYear()} Vyoma Inc. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <a href="#" className="hover:text-pink-900">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-pink-900">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
