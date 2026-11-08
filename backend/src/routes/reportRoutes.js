const express = require('express');
const router = express.Router();
const {
  getLeadConversionReport,
  getSalesPerformanceReport,
  getCustomerDetailsReport,
  getFollowUpActivityReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

// Reports available to Admin and Sales Manager; certain views also available to others
router.get('/lead-conversion', getLeadConversionReport);
router.get('/sales-performance', getSalesPerformanceReport);
router.get('/customer-details', getCustomerDetailsReport);
router.get('/followup-activity', getFollowUpActivityReport);

module.exports = router;
