const express = require('express');
const router = express.Router();
const {
  getFollowUps,
  getFollowUp,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp
} = require('../controllers/followUpController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getFollowUps)
  .post(createFollowUp);

router.route('/:id')
  .get(getFollowUp)
  .put(updateFollowUp)
  .delete(deleteFollowUp);

module.exports = router;
