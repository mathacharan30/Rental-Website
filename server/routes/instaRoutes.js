const express = require('express');
const router = express.Router();
const { addPost, getPosts, deletePost } = require('../controllers/instaController');
const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');
const attachUserRole      = require('../middlewares/attachUserRole');
const { allowRoles }      = require('../middlewares/roleMiddleware');

const storeGuard = [verifyFirebaseToken, attachUserRole, allowRoles(['store_owner', 'super_admin'])];

router.post('/',      ...storeGuard, addPost);
router.get('/',       getPosts);
router.delete('/:id', ...storeGuard, deletePost);

module.exports = router;