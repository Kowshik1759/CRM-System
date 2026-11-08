const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.route('/')
  .get(getCustomers)
  .post(authorize('admin', 'sales_manager', 'sales_executive'), createCustomer);

router.route('/:id')
  .get(getCustomer)
  .put(authorize('admin', 'sales_manager', 'sales_executive', 'customer_support'), updateCustomer)
  .delete(authorize('admin', 'sales_manager'), deleteCustomer);

module.exports = router;
