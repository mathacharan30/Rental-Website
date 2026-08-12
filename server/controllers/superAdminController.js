const firebaseAdmin  = require('../config/firebase');
const User           = require('../models/User');
const Store          = require('../models/Store');
const DeliveryCity   = require('../models/DeliveryCity');
const City           = require('../models/City');

// ─── GET /api/superadmin/stores ───────────────────────────────────────────────
// Returns all Store documents with owner info populated.
exports.getStores = async (req, res) => {
  try {
    const stores = await Store.find()
      .populate('owner', 'name email uid loginPassword')
      .populate('city', 'name')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ stores });
  } catch (err) {
    console.error('[SuperAdmin] getStores:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── POST /api/superadmin/stores ──────────────────────────────────────────────
// Creates a Firebase user + MongoDB User doc + MongoDB Store doc.
// Body: { name, email, password, storeName }
exports.createStore = async (req, res) => {
  const { name, email, password, storeName, city } = req.body;
  if (!name || !email || !password || !storeName) {
    return res.status(400).json({ message: 'name, email, password and storeName are required' });
  }
  try {
    const slug = storeName.trim().toLowerCase().replace(/\s+/g, '-');

    // 1. Create Firebase account (emailVerified = true — admin-created accounts skip verification)
    const firebaseUser = await firebaseAdmin.auth().createUser({
      email,
      password,
      displayName: name,
      emailVerified: true,
    });

    // 2. Persist User in MongoDB (no storeId yet)
    const user = await User.create({
      uid:           firebaseUser.uid,
      email,
      role:          'store_owner',
      storeName:     slug,
      name,
      loginPassword: password,
    });

    // 3. Create Store document
    const store = await Store.create({ name, slug, owner: user._id, city: city || null });

    // 4. Link storeId back onto the User
    user.storeId = store._id;
    await user.save();

    return res.status(201).json({
      message: 'Store created',
      store: { _id: store._id, name: store.name, slug: store.slug, owner: { uid: user.uid, email: user.email, name: user.name } },
    });
  } catch (err) {
    console.error('[SuperAdmin] createStore:', err.message);
    if (err.code === 'auth/email-already-exists') {
      return res.status(409).json({ message: 'Email already in use' });
    }
    return res.status(500).json({ message: 'Server error creating store' });
  }
};

// ─── PUT /api/superadmin/stores/:id ──────────────────────────────────────────
// Updates store name, slug and/or city. Email is intentionally NOT editable.
// Keeps the owner's storeName (URL slug) in sync when the slug changes.
exports.updateStore = async (req, res) => {
  const { id } = req.params;
  const { name, slug, city } = req.body;
  try {
    const store = await Store.findById(id);
    if (!store) return res.status(404).json({ message: 'Store not found' });

    let newSlug = store.slug;
    if (slug !== undefined) {
      newSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');
      store.slug = newSlug;
    }
    if (name !== undefined) store.name = name.trim();
    if (city !== undefined) store.city = city || null;

    await store.save();

    // Keep the owner User's storeName (URL slug) aligned with the store slug.
    if (slug !== undefined) {
      await User.findByIdAndUpdate(store.owner, { storeName: newSlug });
    }

    const populated = await Store.findById(store._id)
      .populate('owner', 'name email uid loginPassword')
      .populate('city', 'name')
      .lean();

    return res.json({ message: 'Store updated', store: populated });
  } catch (err) {
    console.error('[SuperAdmin] updateStore:', err.message);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Store slug already in use' });
    }
    return res.status(500).json({ message: 'Server error updating store' });
  }
};

// ─── PATCH /api/superadmin/stores/:uid/password ──────────────────────────────
// Resets Firebase password + stores it in MongoDB for visibility.
exports.resetStorePassword = async (req, res) => {
  const { uid } = req.params;
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  try {
    await firebaseAdmin.auth().updateUser(uid, { password });
    await User.findOneAndUpdate({ uid }, { loginPassword: password });
    return res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('[SuperAdmin] resetStorePassword:', err.message);
    return res.status(500).json({ message: 'Server error resetting password' });
  }
};

// ─── DELETE /api/superadmin/stores/:uid ──────────────────────────────────────
// Deletes Firebase account + MongoDB User + MongoDB Store for a store_owner.
exports.deleteStore = async (req, res) => {
  const { uid } = req.params;
  try {
    const user = await User.findOne({ uid });
    if (user?.storeId) {
      await Store.findByIdAndDelete(user.storeId);
    }
    await firebaseAdmin.auth().deleteUser(uid);
    await User.findOneAndDelete({ uid });
    return res.json({ message: 'Store deleted' });
  } catch (err) {
    console.error('[SuperAdmin] deleteStore:', err.message);
    return res.status(500).json({ message: 'Server error deleting store' });
  }
};

// ─── GET /api/superadmin/users ────────────────────────────────────────────────
// Returns all users (all roles). Sensitive fields (phone, address) excluded.
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('uid email role storeName storeId name createdAt').lean();
    return res.json({ users });
  } catch (err) {
    console.error('[SuperAdmin] getAllUsers:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─── Delivery Cities ──────────────────────────────────────────────────────────

// GET /api/cities  (public — used by the checkout dropdown)
exports.getCities = async (req, res) => {
  try {
    const cities = await DeliveryCity.find({ active: true }).sort({ name: 1 }).lean();
    return res.json({ cities });
  } catch (err) {
    console.error('[SuperAdmin] getCities:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/superadmin/cities  (super admin — includes inactive)
exports.getAllCities = async (req, res) => {
  try {
    const cities = await DeliveryCity.find().sort({ name: 1 }).lean();
    return res.json({ cities });
  } catch (err) {
    console.error('[SuperAdmin] getAllCities:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/superadmin/cities
exports.createCity = async (req, res) => {
  const { name, deliveryCharge } = req.body;
  if (!name || deliveryCharge === undefined || deliveryCharge === '') {
    return res.status(400).json({ message: 'name and deliveryCharge are required' });
  }
  try {
    const city = await DeliveryCity.create({ name: name.trim(), deliveryCharge: Number(deliveryCharge) });
    return res.status(201).json({ city });
  } catch (err) {
    console.error('[SuperAdmin] createCity:', err.message);
    return res.status(500).json({ message: 'Server error creating city' });
  }
};

// PUT /api/superadmin/cities/:id
exports.updateCity = async (req, res) => {
  const { id } = req.params;
  const { name, deliveryCharge, active } = req.body;
  try {
    const updates = {};
    if (name !== undefined)           updates.name           = name.trim();
    if (deliveryCharge !== undefined) updates.deliveryCharge = Number(deliveryCharge);
    if (active !== undefined)         updates.active         = Boolean(active);
    const city = await DeliveryCity.findByIdAndUpdate(id, updates, { new: true });
    if (!city) return res.status(404).json({ message: 'City not found' });
    return res.json({ city });
  } catch (err) {
    console.error('[SuperAdmin] updateCity:', err.message);
    return res.status(500).json({ message: 'Server error updating city' });
  }
};

// DELETE /api/superadmin/cities/:id
exports.deleteCity = async (req, res) => {
  const { id } = req.params;
  try {
    const city = await DeliveryCity.findByIdAndDelete(id);
    if (!city) return res.status(404).json({ message: 'City not found' });
    return res.json({ message: 'City deleted' });
  } catch (err) {
    console.error('[SuperAdmin] deleteCity:', err.message);
    return res.status(500).json({ message: 'Server error deleting city' });
  }
};

// ─── Store Cities ───────────────────────────────────────────────────────────
// Location cities assigned to stores and used to filter products by city.

// GET /api/store-cities  (public — store dropdown + category-page filter)
exports.getStoreCities = async (req, res) => {
  try {
    const cities = await City.find({ active: true }).sort({ name: 1 }).lean();
    return res.json({ cities });
  } catch (err) {
    console.error('[SuperAdmin] getStoreCities:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/superadmin/store-cities  (super admin — includes inactive)
exports.getAllStoreCities = async (req, res) => {
  try {
    const cities = await City.find().sort({ name: 1 }).lean();
    return res.json({ cities });
  } catch (err) {
    console.error('[SuperAdmin] getAllStoreCities:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/superadmin/store-cities
exports.createStoreCity = async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'name is required' });
  }
  try {
    const city = await City.create({ name: name.trim() });
    return res.status(201).json({ city });
  } catch (err) {
    console.error('[SuperAdmin] createStoreCity:', err.message);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'City already exists' });
    }
    return res.status(500).json({ message: 'Server error creating city' });
  }
};

// PUT /api/superadmin/store-cities/:id
exports.updateStoreCity = async (req, res) => {
  const { id } = req.params;
  const { name, active } = req.body;
  try {
    const updates = {};
    if (name !== undefined)   updates.name   = name.trim();
    if (active !== undefined) updates.active = Boolean(active);
    const city = await City.findByIdAndUpdate(id, updates, { new: true });
    if (!city) return res.status(404).json({ message: 'City not found' });
    return res.json({ city });
  } catch (err) {
    console.error('[SuperAdmin] updateStoreCity:', err.message);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'City already exists' });
    }
    return res.status(500).json({ message: 'Server error updating city' });
  }
};

// DELETE /api/superadmin/store-cities/:id
exports.deleteStoreCity = async (req, res) => {
  const { id } = req.params;
  try {
    const city = await City.findByIdAndDelete(id);
    if (!city) return res.status(404).json({ message: 'City not found' });
    return res.json({ message: 'City deleted' });
  } catch (err) {
    console.error('[SuperAdmin] deleteStoreCity:', err.message);
    return res.status(500).json({ message: 'Server error deleting city' });
  }
};
