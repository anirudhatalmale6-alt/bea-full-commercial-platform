'use strict';
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const logger = require('./lib/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');

// Routes
const authRoutes = require('./routes/auth');
const learnerRoutes = require('./routes/learners');
const classRoutes = require('./routes/classes');
const groupRoutes = require('./routes/groups');
const teacherRoutes = require('./routes/teachers');
const parentRoutes = require('./routes/parents');
const adminRoutes = require('./routes/admin');
const activityRoutes = require('./routes/activities');
const cefrRoutes = require('./routes/cefr');
const curriculumRoutes = require('./routes/curriculum');
const lmsRoutes = require('./routes/lms');
const cmsRoutes = require('./routes/cms');
const scormRoutes = require('./routes/scorm');
const resourceRoutes = require('./routes/resources');
const videoRoutes = require('./routes/videos');

const app = express();

// ── Security ────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  credentials: true,
}));

// ── Rate limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '200'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// ── Parsing & compression ────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// ── Logging ──────────────────────────────────────────────────
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

// ── Health ───────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', version: '2.0.0', services: ['lms','cms','scorm','resources','videos'] }));

// ── Public routes ────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ── Protected routes ─────────────────────────────────────────
app.use(authenticate);
app.use('/api/ey/learners', learnerRoutes);
app.use('/api/ey/classes', classRoutes);
app.use('/api/ey/groups', groupRoutes);
app.use('/api/ey/teachers', teacherRoutes);
app.use('/api/ey/parents', parentRoutes);
app.use('/api/ey/admin', adminRoutes);
app.use('/api/ey/activities', activityRoutes);
app.use('/api/ey/cefr', cefrRoutes);
app.use('/api/ey/curriculum', curriculumRoutes);
app.use('/api/lms', lmsRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/scorm', scormRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/videos', videoRoutes);

// ── 404 ──────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Global error handler ─────────────────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────────
if (require.main === module) {
  const port = parseInt(process.env.PORT || '4000');
  app.listen(port, () => logger.info(`BEA API listening on port ${port}`));
}

module.exports = app;
