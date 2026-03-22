import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAllProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const { firebaseUser, role, storeName, uid, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedDesktop =
        desktopSearchRef.current && desktopSearchRef.current.contains(e.target);
      const clickedMobile =
        mobileSearchRef.current && mobileSearchRef.current.contains(e.target);
      if (!clickedDesktop && !clickedMobile) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const q = searchQuery.trim();
      if (!q) {
        setSuggestions([]);
        return;
      }
      try {
        const [productData, categoryData] = await Promise.all([
          getAllProducts(q),
          getCategories(),
        ]);

        const lowerQ = q.toLowerCase();
        const cats = categoryData
          .filter((c) => c.name?.toLowerCase().includes(lowerQ))
          .map((c) => {
            const imgObj = c.image || {};
            const imgUrl =
              typeof imgObj === "string" ? imgObj : imgObj.url || "";
            return {
              id: c._id || c.id || Math.random().toString(),
              type: "category",
              title: c.name,
              image: imgUrl,
              url: `/products/${encodeURIComponent(c.name.toLowerCase())}`,
            };
          });

        const prods = productData.slice(0, 5).map((p) => ({
          id: p.id,
          type: "product",
          title: p.title,
          category: p.category,
          image: p.image,
          url: `/product/${p.id}`,
        }));

        setSuggestions([...cats, ...prods].slice(0, 6));
      } catch (err) {
        console.error("Failed to fetch search suggestions", err);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setOpen(false);
      setShowSuggestions(false);
    }
  };

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
  const isHomePage = location.pathname === "/";

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
      className={`sticky top-0 z-50 transition-colors duration-150 ${
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
              People & Style
            </Link>

            {/* Desktop nav — public / customer only */}
            {isPublicOrCustomer && isHomePage && (
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
                    className="px-3 py-1.5 rounded-full text-neutral-400 hover:text-white transition-colors duration-150"
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

          {/* Desktop search and auth actions */}
          <div className="flex items-center gap-3">
            <div
              className="hidden md:flex relative mr-2"
              ref={desktopSearchRef}
            >
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center relative w-full"
              >
                <input
                  type="text"
                  placeholder="Search rentals..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="bg-white/10 text-white placeholder-neutral-400 border border-white/20 rounded-full py-1.5 px-4 pr-9 text-sm focus:outline-none focus:border-violet-500 transition-colors w-56"
                />
                <button
                  type="submit"
                  className="absolute right-3 text-neutral-400 hover:text-white transition-colors"
                >
                  <Search size={16} />
                </button>
              </form>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                  {suggestions.map((p) => (
                    <Link
                      key={`${p.type}-${p.id}`}
                      to={p.url}
                      onClick={() => {
                        setShowSuggestions(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                    >
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-10 h-10 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-white/5 rounded-md flex items-center justify-center">
                          <Search size={16} className="text-neutral-500" />
                        </div>
                      )}
                      <div className="flex flex-col text-left">
                        <span className="text-white text-sm font-medium line-clamp-1">
                          {p.title}
                        </span>
                        <span className="text-neutral-400 text-xs text-left">
                          {p.type === "category" ? "Category" : p.category}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

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
                      to="/favorites"
                      className="text-sm text-neutral-400 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-white/5"
                    >
                      Favorites
                    </Link>
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
                <X className="text-white" size={20} />
              ) : (
                <Menu className="text-white" size={18} />
              )}
            </button>
          </div>
        </div>

        {/* ALWAYS VISIBLE MOBILE SEARCH */}
        <div
          className="md:hidden px-4 pb-3 relative z-40"
          ref={mobileSearchRef}
        >
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search rentals..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-white/10 text-white placeholder-neutral-400 border border-white/20 rounded-xl py-2.5 px-4 pr-10 text-sm focus:outline-none focus:border-white/40 transition-all"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <Search size={18} />
            </button>
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-4 right-4 top-full mt-2 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
              {suggestions.map((p) => (
                <Link
                  key={`${p.type}-${p.id}`}
                  to={p.url}
                  onClick={() => {
                    setShowSuggestions(false);
                    setOpen(false);
                    setSearchQuery("");
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                >
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-10 h-10 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-white/5 rounded-md flex items-center justify-center">
                      <Search size={16} className="text-neutral-500" />
                    </div>
                  )}
                  <div className="flex flex-col text-left">
                    <span className="text-white text-sm font-medium line-clamp-1">
                      {p.title}
                    </span>
                    <span className="text-neutral-400 text-xs text-left">
                      {p.type === "category" ? "Category" : p.category}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Mobile menu */}
        <nav
          id="mobile-menu"
          className={`${open ? "block" : "hidden"} md:hidden`}
          aria-hidden={!open}
        >
          <div className="flex flex-col gap-1 pb-4 pt-1 text-sm">
            {/* Public / customer links */}
            {isPublicOrCustomer && isHomePage && (
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
                    className="block px-4 py-3 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5"
                  >
                    {item.label}
                  </a>
                ))}
              </>
            )}

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
                  to="/favorites"
                  onClick={handleMobileLink}
                  className="block px-4 py-3 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5"
                >
                  Favorites
                </Link>
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
