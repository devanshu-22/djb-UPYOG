const express = require('express');
const cors = require('cors');
const { CLIENT_ORIGIN } = require('./config/env');
const driverRoutes = require('./routes/driver.routes');
const notFound = require('./middlewares/notFound.middleware');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use(cors({
  origin: CLIENT_ORIGIN === '*' ? true : CLIENT_ORIGIN.split(',').map((item) => item.trim()),
  methods: ['GET', 'POST'],
}));
app.use(express.json({ limit: '1mb' }));

app.use('/api/v1', driverRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
