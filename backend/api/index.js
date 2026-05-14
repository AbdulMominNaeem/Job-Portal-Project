try {
  module.exports = require('../src/app');
} catch (err) {
  const express = require('express');
  const app = express();
  app.use((_req, res) => res.status(500).json({ error: err.message, stack: err.stack }));
  module.exports = app;
}
