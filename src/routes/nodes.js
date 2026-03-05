const express = require('express');
const { getAllNodes, getNodeById } = require('../controllers/nodesController');

const router = express.Router();

router.get('/', getAllNodes);
router.get('/:id', getNodeById);

module.exports = router;