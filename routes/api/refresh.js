const express = require('express');
const router = express.Router();
const path = require('path');
const {handleRefreshToken} = require('../../Controllers/refreshTokenController')

router.get('/',handleRefreshToken)

module.exports = router