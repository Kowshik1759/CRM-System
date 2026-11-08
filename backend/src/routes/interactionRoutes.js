const express = require('express');
const router = express.Router();
const {
  getInteractions,
  createInteraction,
  deleteInteraction
} = require('../controllers/interactionController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.route('/')
  .get(getInteractions)
  .post(createInteraction);

router.route('/:id')
  .delete(authorize('admin', 'sales_manager'), deleteInteraction);

module.exports = router;

