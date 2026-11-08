const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  updateLeadStage,
  convertLead,
  deleteLead
} = require('../controllers/leadController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.route('/')
  .get(getLeads)
  .post(authorize('admin', 'sales_manager', 'sales_executive'), createLead);

router.route('/:id')
  .get(getLead)
  .put(authorize('admin', 'sales_manager', 'sales_executive'), updateLead)
  .delete(authorize('admin', 'sales_manager'), deleteLead);

router.patch('/:id/stage', authorize('admin', 'sales_manager', 'sales_executive'), updateLeadStage);
router.post('/:id/convert', authorize('admin', 'sales_manager', 'sales_executive'), convertLead);

module.exports = router;

