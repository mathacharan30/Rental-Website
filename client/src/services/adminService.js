import productsSeed from "../data/products";

const PRODUCTS_KEY = "admin_products";
const TESTIMONIALS_KEY = "admin_testimonials";
const CATEGORIES_KEY = "admin_categories";

const loadProducts = () => {
  const raw = localStorage.getItem(PRODUCTS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse products from localStorage", e);
    }
  }
  // seed
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(productsSeed));
  return productsSeed;
};

const saveProducts = (products) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

const addProduct = (product) => {
  const list = loadProducts();
  list.unshift(product);
  saveProducts(list);
  return list;
};

const updateProduct = (id, updates) => {
  const list = loadProducts().map((p) =>
    p.id === id ? { ...p, ...updates } : p,
  );
  saveProducts(list);
  return list;
};

const deleteProduct = (id) => {
  const list = loadProducts().filter((p) => p.id !== id);
  saveProducts(list);
  return list;
};

// Testimonials: simple shape {id, name, message}
const loadTestimonials = () => {
  const raw = localStorage.getItem(TESTIMONIALS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse testimonials", e);
    }
  }
  const seed = [
    { id: "t1", name: "Priya", message: "Great service, beautiful outfits!" },
    { id: "t2", name: "Rahul", message: "Very timely and helpful support." },
  ];
  localStorage.setItem(TESTIMONIALS_KEY, JSON.stringify(seed));
  return seed;
};

const saveTestimonials = (list) => {
  localStorage.setItem(TESTIMONIALS_KEY, JSON.stringify(list));
};

const addTestimonial = (t) => {
  const list = loadTestimonials();
  list.unshift(t);
  saveTestimonials(list);
  return list;
};

const updateTestimonial = (id, updates) => {
  const list = loadTestimonials().map((t) =>
    t.id === id ? { ...t, ...updates } : t,
  );
  saveTestimonials(list);
  return list;
};

const deleteTestimonial = (id) => {
  const list = loadTestimonials().filter((t) => t.id !== id);
  saveTestimonials(list);
  return list;
};

// Categories: { id, name, cover }
const loadCategories = () => {
  const raw = localStorage.getItem(CATEGORIES_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse categories", e);
    }
  }
  // derive initial categories from products seed unique categories
  const seedCats = [];
  try {
    const seen = new Set();
    productsSeed.forEach((p) => {
      if (p.category && !seen.has(p.category)) {
        seen.add(p.category);
        seedCats.push({
          id: `c_${seedCats.length + 1}`,
          name: p.category,
          cover: p.image || "",
        });
      }
    });
  } catch (e) {
    console.error("Failed to derive seed categories", e);
  }
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(seedCats));
  return seedCats;
};

const saveCategories = (list) => {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list));
};

const addCategory = (c) => {
  const list = loadCategories();
  list.unshift(c);
  saveCategories(list);
  return list;
};

const updateCategory = (id, updates) => {
  const list = loadCategories().map((c) =>
    c.id === id ? { ...c, ...updates } : c,
  );
  saveCategories(list);
  return list;
};

const deleteCategory = (id) => {
  const list = loadCategories().filter((c) => c.id !== id);
  saveCategories(list);
  return list;
};

export default {
  loadProducts,
  saveProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  loadTestimonials,
  saveTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  // categories
  loadCategories: () => loadCategories(),
  saveCategories: (list) => saveCategories(list),
  addCategory: (c) => addCategory(c),
  updateCategory: (id, updates) => updateCategory(id, updates),
  deleteCategory: (id) => deleteCategory(id),
};
