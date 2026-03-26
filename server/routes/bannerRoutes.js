const express = require('express');
const router = express.Router();
const { uploadBanner, getBanners, deleteBanner, signBannerUpload } = require('../controllers/bannerController');
const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');
const attachUserRole      = require('../middlewares/attachUserRole');
const { allowRoles }      = require('../middlewares/roleMiddleware');

const storeGuard = [verifyFirebaseToken, attachUserRole, allowRoles(['store_owner', 'super_admin'])];

// sign-upload must come before /:id to avoid being consumed by the param route
router.get('/sign-upload', ...storeGuard, signBannerUpload);
router.post('/',           ...storeGuard, uploadBanner);
router.get('/',            getBanners);
router.delete('/:id',      ...storeGuard, deleteBanner);

module.exports = router;