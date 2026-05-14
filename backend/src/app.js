const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const env = require('./config/env');
const swaggerSpec = require('./config/swagger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const employerRoutes = require('./routes/employerRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MIN * 60 * 1000,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/openapi.json', (_req, res) => res.json(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
