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
  getAllCities,
  createCity,
  updateCity,
  deleteCity,
} = require('../controllers/superAdminController');

// All superadmin routes require: valid Firebase token + super_admin role
const guard = [verifyFirebaseToken, attachUserRole, allowRoles(['super_admin'])];

router.get('/stores',           ...guard, getStores);
router.post('/stores',          ...guard, createStore);
router.delete('/stores/:uid',   ...guard, deleteStore);
router.get('/users',            ...guard, getAllUsers);

// Delivery city management (super admin only)
router.get('/cities',           ...guard, getAllCities);
router.post('/cities',          ...guard, createCity);
router.put('/cities/:id',       ...guard, updateCity);
router.delete('/cities/:id',    ...guard, deleteCity);

module.exports = router;
