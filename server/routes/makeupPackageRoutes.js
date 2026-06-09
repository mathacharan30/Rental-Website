const express = require('express');
const router  = express.Router();
const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');
const attachUserRole      = require('../middlewares/attachUserRole');
const { allowRoles }      = require('../middlewares/roleMiddleware');

const storeGuard = [verifyFirebaseToken, attachUserRole, allowRoles(['store_owner', 'super_admin'])];

const {
  signMakeupPackageUpload,
  getMakeupPackages,
  getMakeupPackageById,
  createMakeupPackage,
  updateMakeupPackage,
  deleteMakeupPackage,
} = require('../controllers/makeupPackageController');

router.get('/sign-upload', ...storeGuard, signMakeupPackageUpload);
router.get('/',    getMakeupPackages);
router.get('/:id', getMakeupPackageById);
router.post('/',        ...storeGuard, createMakeupPackage);
router.put('/:id',      ...storeGuard, updateMakeupPackage);
router.delete('/:id',   ...storeGuard, deleteMakeupPackage);

module.exports = router;
