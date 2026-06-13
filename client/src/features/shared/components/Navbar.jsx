import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, ArrowLeft, ArrowRight, Heart, User, LogOut } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { getAllProducts } from "../../../services/productService";
import { getCategories } from "../../../services/categoryService";
import { HOME_NAV_ITEMS } from "../../../data/Content";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
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
      setMobileSearchOpen(false);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
        setMobileSearchOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMobileSearchOpen(false);
        setShowSuggestions(false);
      }
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

  const closeAllMenus = () => {
    setOpen(false);
    setMobileSearchOpen(false);
    setShowSuggestions(false);
  };

  const handleMobileLink = () => closeAllMenus();

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (closeMobileSearch = false) => {
    setShowSuggestions(false);
    setSearchQuery("");
    setOpen(false);
    if (closeMobileSearch) {
      setMobileSearchOpen(false);
    }
  };

  const renderSuggestions = (containerClassName, closeMobileSearch = false) => {
    if (!showSuggestions || suggestions.length === 0) return null;

    return (
      <div className={containerClassName}>
        {suggestions.map((p) => (
          <Link
            key={`${p.type}-${p.id}`}
            to={p.url}
            onClick={() => handleSuggestionClick(closeMobileSearch)}
            className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/5 transition-colors border-y border-transparent hover:border-white/5"
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
    );
  };

  const handleLogout = async () => {
    await logout();
    closeAllMenus();
    navigate("/");
  };

  const isAdmin = role === "store_owner";
  const isSuperAdmin = role === "super_admin";
  const isPublicOrCustomer = !firebaseUser || role === "customer";
  const isHomePage = location.pathname === "/";

  const dashboardLink = isSuperAdmin
    ? "/superadmin"
    : isAdmin
      ? `/admin/${storeName}/products`
      : null;

  const dashboardLabel = isSuperAdmin
    ? "Super Admin"
    : isAdmin
      ? "Dashboard"
      : null;

  const suggestionItemMotion = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.header
      className="sticky z-50 px-4"
      style={{ top: "var(--floating-nav-offset)" }}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div
        className={`max-w-7xl mx-auto rounded-full border transition-all duration-300 ${scrolled
          ? "border-white/10 bg-[#0a0a0a]/80 shadow-lg shadow-black/30 backdrop-blur-xl"
          : "border-white/5 bg-[#0a0a0a]/40 shadow-md backdrop-blur-md"
          }`}
      >
        <div className="flex items-center justify-between px-4 py-1 md:px-2.5 md:py-2.5 gap-3">
          <div className="flex items-center justify-between gap-12 min-w-0">
            <Link
              to="/"
              className="text-md font-semibold instrument-serif tracking-wide md:pl-4 pl-2 text-white hover:opacity-80 transition-opacity shrink-0"
            >
              People & Style
            </Link>

            {isPublicOrCustomer && isHomePage && (
              <nav
                className="hidden md:flex items-center gap-2 text-xs"
                aria-label="Primary Navigation"
              >
                {HOME_NAV_ITEMS.map((item) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    className="px-4 py-1.5 rounded-full bg-white/2 shadow-inner shadow-white/24 text-neutral-400 border-b-[1.55px] border-white/7 hover:bg-white/10 hover:text-white transition-all duration-200"
                    whileHover={{ y: -0.5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.label}
                  </motion.a>
                ))}
              </nav>
            )}

            {(isAdmin || isSuperAdmin) && (
              <nav
                className="hidden md:flex items-center gap-1 text-sm"
                aria-label="Admin Navigation"
              >
                <Link
                  to={dashboardLink}
                  className="px-4 py-1.5 rounded-full bg-white/2 shadow-inner shadow-white/24 text-violet-400 border-b-[1.55px] border-white/7 hover:bg-white/10 hover:text-violet-300 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {dashboardLabel} <ArrowRight size={20} />
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center ">
            <div
              className="hidden md:flex relative w-64 "
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
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full bg-white/5 border border-white/8 text-white placeholder-neutral-500 rounded-full py-1.5 pl-4 pr-10 text-xs focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-3 text-neutral-400 hover:text-white transition-colors"
                >
                  <Search size={16} />
                </button>
              </form>

              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full right-0 mt-3 w-full overflow-hidden rounded-3xl border border-white/10 bg-[#111111]/95 backdrop-blur-xl shadow-[0_24px_70px_rgba(0,0,0,0.45)] z-50 max-h-96 overflow-y-auto p-2"
                  >
                    {suggestions.map((p, index) => (
                      <motion.div
                        key={`${p.type}-${p.id}`}
                        variants={suggestionItemMotion}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.18, delay: index * 0.03 }}
                      >
                        <Link
                          to={p.url}
                          onClick={() => handleSuggestionClick(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
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
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!loading && (
              <div className="hidden md:flex items-center ml-4 mr-1 gap-2">
                {!firebaseUser ? (
                  <div className="flex items-center gap-1.5">
                    <Link
                      to="/login"
                      className="text-xs font-semibold text-neutral-300 hover:text-white px-4 py-2 hover:bg-white/5 rounded-full transition-all"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="px-4 py-2 bg-violet-600 text-white shadow-inner shadow-white border-b-[1.55px] border-violet-300/40 hover:bg-violet-500 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Sign up</span>
                    </Link>
                  </div>
                ) : role === "customer" ? (
                  <div className="flex items-center gap-1.5">
                    <Link
                      to="/favorites"
                      className="px-3.5 py-1.5 bg-white/2 shadow-inner shadow-white/24 text-neutral-100 border-b-[1.55px] border-white/7 hover:bg-white/10 hover:text-white rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Heart size={13} className="text-violet-400 fill-violet-400/10" />
                      <span>Favorites</span>
                    </Link>
                    <Link
                      to={`/${uid}/profile`}
                      className="px-4 py-1.5 bg-violet-600 text-white shadow-inner shadow-white border-b-[1.55px] border-violet-300/40 hover:bg-violet-500 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <User size={13} />
                      <span>Profile</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="px-3.5 py-1.5 rounded-full border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut size={12} />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleLogout}
                      className="text-xs font-semibold border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 px-4 py-1.5 rounded-full transition-all cursor-pointer"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}

            <button
              type="button"
              className="md:hidden relative w-12 h-12 flex items-center justify-center rounded-xl"
              onClick={() => {
                setMobileSearchOpen((s) => !s);
                setOpen(false);
                setShowSuggestions(false);
              }}
              aria-expanded={mobileSearchOpen}
              aria-controls="mobile-search"
              aria-label={mobileSearchOpen ? "Close search" : "Open search"}
            >
              <Search className="text-white" size={18} />
            </button>

            <button
              type="button"
              className="md:hidden relative px-2 flex items-center justify-center rounded-xl"
              onClick={() => {
                setOpen((s) => !s);
                setMobileSearchOpen(false);
              }}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? (
                <X className="text-white" size={20} />
              ) : (
                <Menu className="text-white" size={20} />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              id="mobile-search"
              className="md:hidden fixed inset-0 z-50 pt-16 px-2"
              onClick={() => {
                setMobileSearchOpen(false);
                setShowSuggestions(false);
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <motion.div
                ref={mobileSearchRef}
                className="rounded-2xl border border-white/10 bg-[#090909]/92 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
                onClick={(e) => e.stopPropagation()}
                initial={{ y: -12, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -10, opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
              >
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative w-full p-2"
                >
                  <input
                    type="text"
                    placeholder="Search rentals..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full text-white placeholder-neutral-400 pt-2 px-4 pr-11 text-base focus:outline-none transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-5 top-1/2 pt-2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  >
                    <Search size={20} />
                  </button>
                </form>

                <div className="px-2 pb-2">
                  {renderSuggestions(
                    "max-h-[55vh] overflow-y-auto rounded-2xl bg-[#111111]/96 border border-white/10 p-1",
                    true,
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          id="mobile-menu"
          className="md:hidden fixed top-16 backdrop-blur-2xl right-2 left-2 z-50"
          style={{ pointerEvents: open ? "auto" : "none" }}
          aria-hidden={!open}
        >
          <AnimatePresence>
            {open && (
              <motion.div
                key="mobile-menu-content"
                initial={{
                  opacity: 0,
                  scale: 0.3,
                  y: -28,
                  transformOrigin: "top right",
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 400, damping: 40 },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.01,
                  y: -28,
                  transition: { duration: 0.3 },
                }}
                className="bg-[#111]/95 border border-white/10 rounded-2xl flex flex-col gap-1.5 py-2.5 px-2.5 text-sm shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                style={{ transformOrigin: "top right" }}
              >
                {isPublicOrCustomer && isHomePage && (
                  <div className="flex flex-col gap-1.5 my-1">
                    {HOME_NAV_ITEMS.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={handleMobileLink}
                        className="block w-full text-center px-4 py-2.5 rounded-full bg-white/2 shadow-inner shadow-white/24 text-neutral-400 border-b-[1.55px] border-white/7 hover:bg-white/10 hover:text-white transition-all text-sm font-semibold"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}

                {(isAdmin || isSuperAdmin) && (
                  <Link
                    to={dashboardLink}
                    onClick={handleMobileLink}
                    className="block w-full text-left px-4 py-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                  >
                    {dashboardLabel}
                  </Link>
                )}
                {isHomePage && (
                  <div className="border-t border-white/10 my-2"></div>
                )}

                {!firebaseUser ? (
                  <div className="flex flex-row gap-1 mt-1">
                    <Link
                      to="/login"
                      onClick={handleMobileLink}
                      className="block px-4 py-2.5 w-full rounded-full text-center text-neutral-300 hover:text-white bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-sm font-medium"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={handleMobileLink}
                      className="block py-2.5 w-full text-center text-white bg-violet-600 shadow-inner shadow-white border-b-[1.55px] border-violet-300/40 hover:bg-violet-500 rounded-full text-sm font-semibold transition-all"
                    >
                      <span>Sign up</span>
                    </Link>
                  </div>
                ) : role === "customer" ? (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex flex-row gap-1">
                      <Link
                        to="/favorites"
                        onClick={handleMobileLink}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-center w-full rounded-full bg-violet-600/10 shadow-inner shadow-white/24 text-neutral-400 border-b-[1.55px] border-white/7 hover:bg-white/10 hover:text-white transition-all text-sm font-semibold"
                      >
                        <Heart size={14} className="text-violet-400" />
                        <span>Favorites</span>
                      </Link>
                      <Link
                        to={`/${uid}/profile`}
                        onClick={handleMobileLink}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 w-full text-center rounded-full bg-violet-600 text-white shadow-inner shadow-white border-b-[1.55px] border-violet-300/40 hover:bg-violet-500 transition-all text-sm font-semibold"
                      >
                        <User size={14} />
                        <span>Profile</span>
                      </Link>
                    </div>


                    <button
                      onClick={handleLogout}
                      className="flex items-center rounded-full justify-center px-4 py-2.5 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all text-sm font-semibold cursor-pointer"
                    >
                      <LogOut size={14} className="mr-1.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 mt-2">
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Navbar;
