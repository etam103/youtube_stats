'use strict';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const SSL = process.env.SSL || 'http';
const HOSTNAME = process.env.HOSTNAME || 'localhost';
const PORT = process.env.PORT || 8080;
const GOOGLE_CALLBACK_URL = `${SSL}://${HOSTNAME}/auth/google/callback`;
const MONGODB_URI = process.env.MONGODB_URI || `mongodb://localhost:${PORT}/test`;

const config = {
  PORT,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  MONGODB_URI,
};

module.exports = config;
