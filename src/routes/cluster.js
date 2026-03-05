const express = require('express');
const { getClusterSummary } = require('../controllers/clusterController');

const router = express.Router();

router.get('/summary', getClusterSummary);

module.exports = router;