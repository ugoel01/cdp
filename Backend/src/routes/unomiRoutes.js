const express = require('express');
const { getPolicyCountHandler } = require('../controllers/unomiController2');

const router = express.Router();

router.get('/policy-count', getPolicyCountHandler);

module.exports = router;
