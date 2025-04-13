const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const connectToDB = require('./db/db');
const userRoutes = require('./routes/captain.routes');
const cookieParser = require('cookie-parser');
const rabbitMQ = require('./service/rabbit');

connectToDB();
rabbitMQ.connect();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/', userRoutes);

module.exports = app;