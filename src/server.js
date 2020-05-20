import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import mysql from 'mysql';

import userRouter from './routers/user-router';
import authRouter from './routers/auth-router';
import stateRouter from './routers/state-router';
import countyRouter from './routers/county-router';
import caseCountRouter from './routers/case-count-router';


import requireAuth from './authentication/require-auth';

require('dotenv').config();

// initialize server
const app = express();

// enable cross origin resource sharing
app.use(cors());

// enable/disable http request logging
app.use(morgan('dev'));

// enable static assets in directory static
app.use(express.static('static'));

// enable json message body for posting data to API, extend default size limit
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }));

// allow cors
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

// create database connection
app.use((req, res, next) => {
	global.connection = mysql.createConnection({
		host: process.env.HOST,
		user: process.env.USERNAME,
		password: process.env.PASSWORD,
		database: process.env.SCHEMA,
	});
	global.connection.connect();
	next();
});

// create global database connection
global.connection = mysql.createConnection({
	host: process.env.HOST,
	user: process.env.USERNAME,
	password: process.env.PASSWORD,
	database: process.env.SCHEMA,
});
global.connection.connect();

// attach routers
app.use('/api/users', requireAuth, userRouter);
app.use('/api/authentication', authRouter);
app.use('/api/states', stateRouter);
app.use('/api/counties', countyRouter);
app.use('/api/counts', caseCountRouter);


// start listening
app.listen(process.env.PORT, () => {
	console.log(`Listening on port ${process.env.PORT}`);
});
