'use strict';

const youtube = require('../youtube');
const express = require('express');

const router = express.Router();

// NOTE: - hardcoding channel for now
// const channelId = 'UC8butISFwT-Wl7EV0hUK0BQ';
const channelId = undefined;

/* GET liveStream page. */
router.get('/', async (req, res) => {
  const { user } = req;
  const { accessToken, refreshToken } = user;

  youtube.setTokens(accessToken, refreshToken);

  const channelData = await youtube.listChannelsWithActiveLiveStreams(channelId);
  const { items } = channelData;
  const item = items[1];
  const { videoId } = item.id;

  res.render('liveStream', { videoId, pageName: 'liveStream' });
});

module.exports = router;
