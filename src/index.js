const userRouter = require('./api/routes/user.routes.js')
const eventRouter = require('./api/routes/event.routes.js')
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config({path: '../.env'});
const connectDB = require('./config/db.js');
const { configCloudinary } = require('./middlewares/files.middleware.js');


const express = require('express');
const PORT = 3000;

connectDB();
configCloudinary();

const server = express();

server.use(express.json());
server.use(express.urlencoded({extended: false}));
server.use(cookieParser());
server.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    headers: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range'],
    secure: true,
    credentials: true
  }));

server.use('/api/v1/user', userRouter);
server.use('/api/v1/events', eventRouter);

server.use('*', (req, res, next) => {
    const err = new Error('Route not found');
    err.status = 404;
    next(err);
})

server.listen(PORT, () => {
    console.log('server running in http://localhost:'+PORT);
})