const express = require('express');
const { createMessage, getMessagesByNode } = require('../controllers/messagesController');

const router = express.Router();

router.post('/', createMessage);
router.get('/:node_id', getMessagesByNode);

module.exports = router;