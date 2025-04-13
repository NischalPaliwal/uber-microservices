const captainModel = require('../models/captain.model');
const blacklisttokenModel = require('../models/blacklisttoken.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { subscribeToQueue } = require('../service/rabbit');

const pendingRequests = [];

module.exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await captainModel.findOne({ email });

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hash = await bcrypt.hash(password, 10);
        const newUser = new captainModel({ name, email, password: hash });

        await newUser.save();

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token);
        res.send({ message: 'User created successfully!', token, newUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await captainModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token);
        res.send({ message: 'User logged in successfully!', token, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.logout = async (req, res) => {
    try {
        const token = req.cookies.token;
        await blacklisttokenModel.create({ token });
        res.clearCookie('token');
        res.send({ message: 'User logged out successfully!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.profile = async (req, res) => {
    try {
        res.send(req.captain);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.toggleAvailability = async (req, res) => {
    try {
        const captain = await captainModel.findById(req.captain._id);
        captain.isAvailable = !captain.isAvailable;
        await captain.save();
        res.send(captain);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.waitForNewRide = async (req, res) => {
    req.setTimeout(() => {
        res.status(204).end();
    }, 30000);

    pendingRequests.push(res);
}

subscribeToQueue("new-ride", (data) => {
    const rideData = JSON.parse(data);

    pendingRequests.forEach((res) => {
        res.json({ data: rideData });
    });

    pendingRequests.length = 0;
});