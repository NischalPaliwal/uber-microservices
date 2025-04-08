const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const connectToDB = require('./db/db');
const rideRoutes = require('./routes/ride.routes');
const cookieParser = require('cookie-parser');
const rabbitMQ = require('./service/rabbit');
const app = express();

connectToDB();
rabbitMQ.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', rideRoutes);

module.exports = app;