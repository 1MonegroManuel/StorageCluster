const express = require('express');
const {
    getLatestMetrics,
    getLatestMetricsByNode,
    getMetricsHistoryByNode
} = require('../controllers/metricsController');

const router = express.Router();

router.get('/latest', getLatestMetrics);
router.get('/node/:id', getLatestMetricsByNode);
router.get('/history/:id', getMetricsHistoryByNode);

module.exports = router;