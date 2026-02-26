import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoClose } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const { firebaseUser, role, storeName, uid, logout, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleMobileLink = () => setOpen(false);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/");
  };

  const isAdmin = role === "store_owner";
  const isSuperAdmin = role === "super_admin";
  const isPublicOrCustomer = !firebaseUser || role === "customer";

  const dashboardLink = isSuperAdmin
    ? "/superadmin"
    : isAdmin
      ? `/admin/${storeName}`
      : null;

  const dashboardLabel = isSuperAdmin
    ? "Super Admin"
    : isAdmin
      ? "Dashboard"
      : null;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0e0e0e]/90 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link
              to="/"
              className="text-xl font-semibold tracking-tight text-white hover:opacity-80 transition-opacity"
            >
              people & style
            </Link>

            {/* Desktop nav — public / customer only */}
            {isPublicOrCustomer && (
              <nav
                className="hidden md:flex items-center gap-1 text-sm"
                aria-label="Primary Navigation"
              >
                {[
                  { href: "#categories", label: "Categories" },
                  { href: "#products", label: "Rentals" },
                  { href: "#gallery", label: "Gallery" },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="px-3 py-1.5 rounded-full text-neutral-400 hover:text-white  transition-all duration-300"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            )}

            {/* Desktop nav — admin / super admin */}
            {(isAdmin || isSuperAdmin) && (
              <nav
                className="hidden md:flex items-center gap-1 text-sm"
                aria-label="Admin Navigation"
              >
                <Link
                  to={dashboardLink}
                  className="px-3 py-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  {dashboardLabel}
                </Link>
              </nav>
            )}
          </div>

          {/* Desktop right-side auth actions */}
          <div className="flex items-center gap-3">
            {!loading && (
              <div className="hidden md:flex items-center gap-3">
                {!firebaseUser ? (
                  <>
                    <Link
                      to="/login"
                      className="text-sm text-neutral-400 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-white/5"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="text-sm bg-violet-600 text-white py-1.5 px-5 rounded-lg hover:bg-violet-700 transition-colors"
                    >
                      <span>Sign up</span>
                    </Link>
                  </>
                ) : role === "customer" ? (
                  <>
                    <Link
                      to={`/${uid}/profile`}
                      className="text-sm text-neutral-400 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-white/5"
                    >
                      Profile
                    </Link>
                    <span className="text-xs text-violet-400 capitalize border border-violet-500/20 bg-violet-500/10 px-3 py-1 rounded-lg">
                      customer
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-violet-400 capitalize border border-violet-500/20 bg-violet-500/10 px-3 py-1 rounded-lg">
                      {role === "store_owner" ? "Store Admin" : "Super Admin"}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}

            <button
              className="md:hidden relative w-12 h-12 flex items-center justify-center rounded-xl "
              onClick={() => setOpen((s) => !s)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? (
                <IoClose className="text-white text-xl" />
              ) : (
                <RxHamburgerMenu className="text-white text-lg" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <nav
          id="mobile-menu"
          ref={menuRef}
          className={`${
            open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          } md:hidden overflow-hidden transition-all duration-500 ease-in-out`}
          aria-hidden={!open}
        >
          <div className="flex flex-col gap-1 pb-4 text-sm">
            {/* Public / customer links */}
            {isPublicOrCustomer && (
              <>
                {[
                  { href: "#categories", label: "Categories" },
                  { href: "#products", label: "Rentals" },
                  { href: "#gallery", label: "Gallery" },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={handleMobileLink}
                    className="block px-4 py-3 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {item.label}
                  </a>
                ))}
              </>
            )}

            {/* Admin / super admin dashboard link */}
            {(isAdmin || isSuperAdmin) && (
              <Link
                to={dashboardLink}
                onClick={handleMobileLink}
                className="block px-4 py-3 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5"
              >
                {dashboardLabel}
              </Link>
            )}

            <div className="h-px bg-white/10 my-2" />

            {/* Auth actions */}
            {!firebaseUser ? (
              <>
                <Link
                  to="/login"
                  onClick={handleMobileLink}
                  className="block px-4 py-3 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={handleMobileLink}
                  className="block mx-2 py-3 rounded-full text-center btn-funky"
                >
                  <span>Sign up</span>
                </Link>
              </>
            ) : role === "customer" ? (
              <>
                <Link
                  to={`/${uid}/profile`}
                  onClick={handleMobileLink}
                  className="block px-4 py-3 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5"
                >
                  Profile
                </Link>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-violet-400 capitalize border border-violet-500/20 bg-violet-500/10 px-3 py-1 rounded-lg">
                    Customer
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs text-violet-400 capitalize border border-violet-500/20 bg-violet-500/10 px-3 py-1 rounded-lg">
                  {role === "store_owner" ? "Store Admin" : "Super Admin"}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
