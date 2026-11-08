const express = require('express');
const router = express.Router();
const {
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity
} = require('../controllers/opportunityController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.route('/')
  .get(getOpportunities)
  .post(authorize('admin', 'sales_manager', 'sales_executive'), createOpportunity);

router.route('/:id')
  .get(getOpportunity)
  .put(authorize('admin', 'sales_manager', 'sales_executive'), updateOpportunity)
  .delete(authorize('admin', 'sales_manager'), deleteOpportunity);

module.exports = router;

