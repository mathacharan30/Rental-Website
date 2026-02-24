const Order   = require('../models/Order');
const Product = require('../models/Product');
const Store   = require('../models/Store');

// ─── POST /api/orders  (customer) ────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { productId, size, startDate, endDate, notes } = req.body;

    if (!productId) return res.status(400).json({ message: 'productId is required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!product.store) return res.status(400).json({ message: 'Product has no associated store' });

    const order = await Order.create({
      customer:        req.user.dbId,
      product:         product._id,
      store:           product.store,
      size:            size || '',
      startDate:       startDate || null,
      endDate:         endDate   || null,
      notes:           notes     || '',
      // Snapshot pricing at order time
      rentPrice:       product.rentPrice,
      commissionPrice: product.commissionPrice,
      advanceAmount:   product.advanceAmount,
      totalPrice:      product.rentPrice + product.commissionPrice,
    });

    const populated = await order.populate([
      { path: 'product', select: 'name images rentPrice commissionPrice advanceAmount' },
      { path: 'store',   select: 'name slug' },
    ]);

    return res.status(201).json(populated);
  } catch (err) {
    console.error('[Orders] createOrder:', err.message);
    return res.status(500).json({ message: 'Server error creating order' });
  }
};

// ─── GET /api/orders/mine  (customer – their own orders) ─────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.dbId })
      .populate({ path: 'product', select: 'name images rentPrice commissionPrice advanceAmount category', populate: { path: 'category', select: 'name' } })
      .populate('store', 'name slug')
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    console.error('[Orders] getMyOrders:', err.message);
    return res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// ─── GET /api/orders/store  (store_owner – their store's orders) ──────────────
exports.getStoreOrders = async (req, res) => {
  try {
    let storeId;
    if (req.user.role === 'super_admin') {
      // super_admin can pass ?storeId= or ?storeName=
      if (req.query.storeId) {
        storeId = req.query.storeId;
      } else if (req.query.storeName) {
        const store = await Store.findOne({ slug: req.query.storeName });
        if (!store) return res.json([]);
        storeId = store._id;
      } else {
        return res.json([]);
      }
    } else {
      storeId = req.user.storeId;
      if (!storeId) return res.json([]);
    }

    const orders = await Order.find({ store: storeId })
      .populate({
        path: 'product',
        select: 'name images rentPrice commissionPrice advanceAmount category',
        populate: { path: 'category', select: 'name' },
      })
      .populate('customer', 'name email phone address')
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (err) {
    console.error('[Orders] getStoreOrders:', err.message);
    return res.status(500).json({ message: 'Server error fetching store orders' });
  }
};

// ─── GET /api/orders/all  (super_admin – every order with commission) ─────────
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: 'product',
        select: 'name images rentPrice commissionPrice advanceAmount category',
        populate: { path: 'category', select: 'name' },
      })
      .populate('customer', 'name email phone address')
      .populate('store', 'name slug')
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (err) {
    console.error('[Orders] getAllOrders:', err.message);
    return res.status(500).json({ message: 'Server error fetching all orders' });
  }
};

// ─── PATCH /api/orders/:id/status  (store_owner / super_admin) ───────────────
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // store_owner can only update their own store's orders
    if (req.user.role === 'store_owner' && String(order.store) !== String(req.user.storeId)) {
      return res.status(403).json({ message: 'Not authorised' });
    }

    order.status = status;
    await order.save();
    return res.json(order);
  } catch (err) {
    console.error('[Orders] updateOrderStatus:', err.message);
    return res.status(500).json({ message: 'Server error updating order' });
  }
};
