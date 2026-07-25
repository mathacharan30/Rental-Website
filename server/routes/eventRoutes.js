const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');
const attachUserRole      = require('../middlewares/attachUserRole');
const { allowRoles }      = require('../middlewares/roleMiddleware');

const storeGuard = [verifyFirebaseToken, attachUserRole, allowRoles(['store_owner', 'super_admin'])];
const {
  signEventUpload,
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');

// sign-upload must come before /:id to avoid being consumed by the param route
router.get('/sign-upload', ...storeGuard, signEventUpload);
router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', ...storeGuard, createEvent);
router.put('/:id', ...storeGuard, updateEvent);
router.delete('/:id', ...storeGuard, deleteEvent);

module.exports = router;
