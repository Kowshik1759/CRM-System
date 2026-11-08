const express = require('express');
const router = express.Router();
const { getPipeline } = require('../controllers/pipelineController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getPipeline);

module.exports = router;

