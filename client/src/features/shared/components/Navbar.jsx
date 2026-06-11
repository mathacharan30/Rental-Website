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
      className="sticky z-50 px-2 sm:px-4"
      style={{ top: "var(--floating-nav-offset)" }}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div
        className={`max-w-7xl mx-auto rounded-full border-y-2 border transition-all duration-300 ${scrolled
          ? "border-white/12 bg-linear-to-r from-[#0a0a0a]/68  shadow-[#11111190] shadow-2xl backdrop-blur-xl"
          : "border-white/8 bg-linear-to-r from-[#0a0a0a]/48  shadow-[#12121250] shadow-lg backdrop-blur-xl"
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
                className="hidden md:flex items-center gap-1 text-sm"
                aria-label="Primary Navigation"
              >
                {HOME_NAV_ITEMS.map((item) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    className="px-4 py-1.5 rounded-full bg-white/10 text-neutral-300 hover:text-white transition-colors duration-150"
                    whileHover={{ y: -1, scale: 1.03 }}
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
                  className="px-3 py-1.5 rounded-full flex items-center gap-1 text-violet-400 capitalize border hover:bg-violet-500/20 border-violet-500/20 bg-violet-500/10 transition-all"
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
                  className="w-full bg-white/8 text-white placeholder-neutral-400 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-violet-400 focus:bg-white/25 transition-all"
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
              <div className="hidden md:flex items-center ml-4 mr-1">
                {!firebaseUser ? (
                  <div className="flex items-center gap-1">
                    <Link
                      to="/login"
                      className="text-sm text-white hover:text-white bg-white/10 rounded-l-4xl rounded-r-md transition-colors px-5 py-2 hover:bg-white/5"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="text-sm bg-violet-600 text-white py-2 px-5 rounded-r-4xl rounded-l-md hover:bg-violet-700 transition-colors"
                    >
                      <span>Sign up</span>
                    </Link>
                  </div>
                ) : role === "customer" ? (
                  <div className="flex items-center gap-1">
                    <Link
                      to="/favorites"
                      className="text-sm border border-violet-400/20 hover:border-violet-500/30 bg-white/[0.02] text-neutral-300 hover:text-white transition-colors px-3.5 py-1.5 rounded-l-4xl rounded-md flex items-center gap-1.5 hover:bg-violet-500/20"
                    >
                      <Heart size={13} className="text-violet-400 fill-violet-400/10" />
                      <span>Favorites</span>
                    </Link>
                    <Link
                      to={`/${uid}/profile`}
                      className="text-sm bg-violet-600/10 border border-violet-300/20 hover:bg-violet-500/60 text-white font-semibold transition-colors px-4 py-1.5 rounded flex items-center gap-1.5"
                    >
                      <User size={13} />
                      <span>Profile</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="text-sm bg-red-650/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors px-3.5 py-1.5 rounded-r-4xl rounded-l-md hover:bg-red-500/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut size={12} />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-white mx-4 bg-red-600 px-4 py-1.5 rounded-full hover:bg-red-800 transition-colors"
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
                className="bg-[#141414] rounded-3xl flex flex-col gap-1.5 py-2.5 px-2.5 text-sm border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                style={{ transformOrigin: "top right" }}
              >
                {isPublicOrCustomer && isHomePage && (
                  <>
                    {HOME_NAV_ITEMS.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={handleMobileLink}
                        className="block px-4 py-3 rounded-2xl text-neutral-300 hover:text-white bg-[#1a1a1a] shadow-[3px_3px_8px_rgba(0,0,0,0.6),-3px_-3px_8px_rgba(55,55,55,0.15)] hover:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_rgba(55,55,55,0.12)] active:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.6),inset_-3px_-3px_8px_rgba(55,55,55,0.1)] transition-all duration-200"
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
                    className="block px-4 py-3 rounded-2xl text-neutral-300 hover:text-white bg-[#1a1a1a] shadow-[3px_3px_8px_rgba(0,0,0,0.6),-3px_-3px_8px_rgba(55,55,55,0.15)] hover:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_rgba(55,55,55,0.12)] active:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.6),inset_-3px_-3px_8px_rgba(55,55,55,0.1)] transition-all duration-200"
                  >
                    {dashboardLabel}
                  </Link>
                )}
                {isHomePage && (
                  <div className="border-t border-white/10 my-4"></div>
                )}

                {!firebaseUser ? (
                  <div className="flex flex-row  gap-1">
                    <Link
                      to="/login"
                      onClick={handleMobileLink}
                      className="block px-4 py-3 w-full rounded-l-2xl rounded-r-sm text-center text-white bg-[#1a1a1a] shadow-[3px_3px_8px_rgba(0,0,0,0.6),-3px_-3px_8px_rgba(55,55,55,0.15)] hover:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_rgba(55,55,55,0.12)] active:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.6),inset_-3px_-3px_8px_rgba(55,55,55,0.1)] transition-all duration-200"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={handleMobileLink}
                      className="block py-3 rounded-l-sm w-full rounded-r-2xl text-center text-white bg-violet-600 shadow-[3px_3px_10px_rgba(0,0,0,0.5),-3px_-3px_10px_rgba(139,92,246,0.15)] hover:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.4),inset_-2px_-2px_6px_rgba(139,92,246,0.2)] active:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.5),inset_-3px_-3px_8px_rgba(139,92,246,0.15)] transition-all duration-200"
                    >
                      <span>Sign up</span>
                    </Link>
                  </div>
                ) : role === "customer" ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex flex-row gap-1 mb-1">
                      <Link
                        to="/favorites"
                        onClick={handleMobileLink}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-center w-full rounded-l-2xl rounded text-neutral-300 hover:text-white bg-[#1a1a1a] shadow-[3px_3px_8px_rgba(0,0,0,0.6),-3px_-3px_8px_rgba(55,55,55,0.15)] hover:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_rgba(55,55,55,0.12)] active:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.6),inset_-3px_-3px_8px_rgba(55,55,55,0.1)] transition-all duration-200"
                      >
                        <Heart size={14} className="text-violet-400" />
                        <span>Favorites</span>
                      </Link>
                      <Link
                        to={`/${uid}/profile`}
                        onClick={handleMobileLink}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 w-full text-center rounded-r-2xl rounded text-white font-semibold bg-violet-600/30 shadow-[3px_3px_10px_rgba(0,0,0,0.5),-3px_-3px_10px_rgba(139,92,246,0.12)] hover:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.4),inset_-2px_-2px_6px_rgba(139,92,246,0.15)] active:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.5),inset_-3px_-3px_8px_rgba(139,92,246,0.12)] transition-all duration-200"
                      >
                        <User size={14} />
                        <span>Profile</span>
                      </Link>
                    </div>

                    <div className="flex items-center rounded-2xl justify-between px-4 py-2.5 bg-[#1a1a1a] shadow-[3px_3px_8px_rgba(0,0,0,0.6),-3px_-3px_8px_rgba(55,55,55,0.15)] hover:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_rgba(55,55,55,0.12)] transition-all duration-200">
                      <button
                        onClick={handleLogout}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors text-center w-full flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Navbar;
