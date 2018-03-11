'use strict';

'use strict';

const express = require('express');

const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = require('../config');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
//   might want to store accessToken and refreshToken to let the user know to refresh
//   store user sessions
//   might want to store refresh tokens in database
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: GOOGLE_CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => {
  done(null, { id: profile.id, accessToken, refreshToken });
}));

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
router.get('/google', passport.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/plus.login', 'email', 'https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/youtube.readonly'],
  prompt: 'consent',
  accessType: 'offline',
}));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    if (typeof (req.session.accessDeniedUrl) !== 'undefined') {
      res.redirect(req.session.accessDeniedUrl);
    } else {
      res.redirect('/liveStream');
    }
  },
);

module.exports = router;
