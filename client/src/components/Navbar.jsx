import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
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
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
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

  const dashboardLabel = isSuperAdmin ? "Super Admin" : isAdmin ? "Dashboard" : null;

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-neutral-700">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link
              to="/"
              className="text-xl font-medium flex items-end justify-center tracking-tight text-pink-700"
            >
              People & Style
            </Link>

            {/* Desktop nav — public / customer only */}
            {isPublicOrCustomer && (
              <nav
                className="hidden md:flex items-center gap-6 text-sm text-neutral-100"
                aria-label="Primary Navigation"
              >
                <a href="#categories" className="hover:text-pink-400 transition-colors">
                  Categories
                </a>
                <a href="#products" className="hover:text-pink-400 transition-colors">
                  Products
                </a>
                <a href="#gallery" className="hover:text-pink-400 transition-colors">
                  Gallery
                </a>
              </nav>
            )}

            {/* Desktop nav — admin / super admin */}
            {(isAdmin || isSuperAdmin) && (
              <nav
                className="hidden md:flex items-center gap-6 text-sm text-neutral-100"
                aria-label="Admin Navigation"
              >
                <Link
                  to={dashboardLink}
                  className="hover:text-pink-400 transition-colors"
                >
                  {dashboardLabel}
                </Link>
              </nav>
            )}
          </div>

          {/* Desktop right-side auth actions */}
          <div className="flex items-center gap-4">
            {!loading && (
              <div className="hidden md:flex items-center gap-3">
                {!firebaseUser ? (
                  <>
                    <Link
                      to="/login"
                      className="text-sm text-neutral-100 hover:text-pink-400 transition-colors hover:underline"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="text-sm bg-neutral-800 border border-neutral-600 text-neutral-100 px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity"
                    >
                      Sign up
                    </Link>
                  </>
                ) : role === "customer" ? (
                  <>
                    <Link
                      to={`/${uid}/profile`}
                      className="text-sm text-neutral-100 hover:text-pink-400 transition-colors"
                    >
                      Profile
                    </Link>
                    <span className="text-xs text-neutral-500 capitalize border border-neutral-700 px-2 py-0.5 rounded-full">
                      customer
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-neutral-400 hover:text-red-400 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-neutral-500 capitalize border border-neutral-700 px-2 py-0.5 rounded-full">
                      {role === "store_owner" ? "Store Admin" : "Super Admin"}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-neutral-400 hover:text-red-400 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Hamburger */}
            <button
              className="md:hidden"
              onClick={() => setOpen((s) => !s)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <RxHamburgerMenu className="text-neutral-100 text-xl" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <nav
          id="mobile-menu"
          ref={menuRef}
          className={`${
            open ? "max-h-screen" : "max-h-0"
          } md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out`}
          aria-hidden={!open}
        >
          <div className="flex flex-col gap-2 pb-4 text-sm text-neutral-100">
            {/* Public / customer links */}
            {isPublicOrCustomer && (
              <>
                <a
                  href="#categories"
                  onClick={handleMobileLink}
                  className="block px-2 py-2 rounded hover:bg-neutral-800"
                >
                  Categories
                </a>
                <a
                  href="#products"
                  onClick={handleMobileLink}
                  className="block px-2 py-2 rounded hover:bg-neutral-800"
                >
                  Products
                </a>
                <a
                  href="#gallery"
                  onClick={handleMobileLink}
                  className="block px-2 py-2 rounded hover:bg-neutral-800"
                >
                  Gallery
                </a>
              </>
            )}

            {/* Admin / super admin dashboard link */}
            {(isAdmin || isSuperAdmin) && (
              <Link
                to={dashboardLink}
                onClick={handleMobileLink}
                className="block px-2 py-2 rounded hover:bg-neutral-800"
              >
                {dashboardLabel}
              </Link>
            )}

            {/* Auth actions */}
            {!firebaseUser ? (
              <>
                <Link
                  to="/login"
                  onClick={handleMobileLink}
                  className="block px-2 py-2 rounded hover:bg-neutral-800"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={handleMobileLink}
                  className="block px-2 py-2 w-full bg-neutral-800 rounded text-white text-center"
                >
                  Sign up
                </Link>
              </>
            ) : role === "customer" ? (
              <>
                <Link
                  to={`/${uid}/profile`}
                  onClick={handleMobileLink}
                  className="block px-2 py-2 rounded hover:bg-neutral-800"
                >
                  Profile
                </Link>
                <div className="flex items-center justify-between px-2 py-2">
                  <span className="text-xs text-neutral-500 capitalize border border-neutral-700 px-2 py-0.5 rounded-full">
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
              <div className="flex items-center justify-between px-2 py-2">
                <span className="text-xs text-neutral-500 capitalize border border-neutral-700 px-2 py-0.5 rounded-full">
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
