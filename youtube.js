'use strict';

// NOTE: - make this a singleton for now and change it to a class if needed later
// NOTE: - check if accessToken and refreshToken is null or not, if not null don't make a new one
// TODO: - have a check if I have accessToken and refreshToken set for each function call.
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = require('./config');
const { google } = require('googleapis');

const OAuth2Client = google.auth.OAuth2;
const oAuth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
);

const youtube = google.youtube({
  version: 'v3',
  auth: oAuth2Client,
});

function setTokens(accessToken, refreshToken) {
  oAuth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
}

function listVideosById(videoId) {
  return new Promise((resolve, reject) => {
    youtube.videos.list({
      part: 'id, snippet,contentDetails, statistics, liveStreamingDetails',
      id: videoId,
      headers: {},
    }, (err, res) => {
      if (err) {
        return reject(err);
      }

      return resolve(res.data);
    });
  });
}

// lets start with single user oauth2 first and move to multi user later
function listLiveChatMessagesById(liveChatId, pageToken) {
  return new Promise((resolve, reject) => {
    youtube.liveChatMessages.list({
      part: 'id, snippet, authorDetails',
      liveChatId,
      pageToken,
      headers: {},
    }, (err, res) => {
      if (err) {
        return reject(err);
      }

      return resolve(res.data);
    });
  });
}

function listChannelsWithActiveLiveStreams(channelId) {
  return new Promise((resolve, reject) => {
    youtube.search.list({
      part: 'snippet',
      channelId,
      eventType: 'live',
      type: 'video',
      broadcastStatus: 'all',
      broadcastType: 'all',
      headers: {},
    }, (err, res) => {
      if (err) {
        return reject(err);
      }

      return resolve(res.data);
    });
  });
}

module.exports = {
  setTokens,
  listVideosById,
  listLiveChatMessagesById,
  listChannelsWithActiveLiveStreams,
};
