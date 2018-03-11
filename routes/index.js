'use strict';

const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { pageName: 'index' });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
