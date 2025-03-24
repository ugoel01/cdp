const express = require('express');
const router = express.Router();

const { getPolicyCountHandler } = require('../controllers/unomiController2');
router.get('/policy-count', getPolicyCountHandler);

const { getActiveProfiles } = require('../controllers/unomiController');
router.get('/active-profiles', getActiveProfiles);

module.exports = router;
