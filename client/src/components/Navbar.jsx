import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleMobileLink = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]  border-b border-neutral-700 ">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-xl font-medium flex items-end  justify-center tracking-tight text-pink-700"
            >
              Vy
              <span className="h-[13px] w-[13px] mb-1.5 bg-pink-700 rounded-full"></span>
              ma
            </Link>

            <nav
              className="hidden md:flex items-center gap-6 text-sm text-neutral-100"
              aria-label="Primary Navigation"
            >
              <a href="#categories" className="hover:text-base-charcoal">
                Categories
              </a>
              <a href="#products" className="hover:text-base-charcoal">
                Products
              </a>
              <a href="#gallery" className="hover:text-base-charcoal">
                Gallery
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm text-neutral-100 hover:text-base-charcoal hover:underline"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-sm bg-base-charcoal text-neutral-100 px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity"
              >
                Sign up
              </Link>
            </div>

            <button
              className="md:hidden "
              onClick={() => setOpen((s) => !s)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <RxHamburgerMenu className="text-neutral-100 text-xl" />
            </button>
          </div>
        </div>

        <nav
          id="mobile-menu"
          ref={menuRef}
          className={`${
            open ? "max-h-screen" : "max-h-0"
          } md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out`}
          aria-hidden={!open}
        >
          <div className="flex flex-col gap-2 pb-4 text-sm text-neutral-100">
            <a
              href="#categories"
              onClick={handleMobileLink}
              className="block px-2 py-2 rounded hover:bg-neutral-200/50"
            >
              Categories
            </a>
            <a
              href="#products"
              onClick={handleMobileLink}
              className="block px-2 py-2 rounded hover:bg-neutral-200/50"
            >
              Products
            </a>
            <a
              href="#gallery"
              onClick={handleMobileLink}
              className="block px-2 py-2 rounded hover:bg-neutral-200/50"
            >
              Gallery
            </a>
            <Link
              to="/login"
              onClick={handleMobileLink}
              className="block px-2 py-2 rounded hover:bg-neutral-200/50"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              onClick={handleMobileLink}
              className="block px-2 py-2 w-full bg-white rounded bg-base-charcoal text-black text-center"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
