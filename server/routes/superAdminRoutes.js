const express = require('express');
const router  = express.Router();

const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');
const attachUserRole      = require('../middlewares/attachUserRole');
const { allowRoles }      = require('../middlewares/roleMiddleware');
const {
  getStores,
  createStore,
  deleteStore,
  getAllUsers,
} = require('../controllers/superAdminController');

// All superadmin routes require: valid Firebase token + super_admin role
const guard = [verifyFirebaseToken, attachUserRole, allowRoles(['super_admin'])];

router.get('/stores',        ...guard, getStores);
router.post('/stores',       ...guard, createStore);
router.delete('/stores/:uid',...guard, deleteStore);
router.get('/users',         ...guard, getAllUsers);

module.exports = router;
