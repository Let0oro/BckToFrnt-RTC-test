const userRouter = require('./api/routes/user.routes.js')
const eventRouter = require('./api/routes/event.routes.js')
const cookieParser = require('cookie-parser');
const cors = require('cors');

const express = require('express');
const PORT = 3000;

const connectDB = require('./config/db.js');
connectDB();

const server = express();

server.use(express.json());
server.use(express.urlencoded({extended: false}));
server.use(cookieParser());
server.use(cors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    headers: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range'],
    credentials: true
  }));

server.use('/api/v1/user', userRouter);
server.use('/api/v1/events', eventRouter);

server.use('*', (res, req, next) => {
    const err = new Error('Route not found');
    err.status = 404;
    next(err);
})

server.listen(PORT, () => {
    console.log('server running in http://localhost:'+PORT);
})