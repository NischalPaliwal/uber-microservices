const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const rideController = require('../controllers/ride.controller');

router.post('/create-ride', authMiddleware.userAuth, rideController.createRide);
router.patch('/accept-ride', authMiddleware.captainAuth, rideController.acceptRide);

module.exports = router;