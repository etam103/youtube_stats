'use strict';

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const expressSession = require('express-session');
const monk = require('monk');
const index = require('./routes/index');
const auth = require('./routes/auth');
const liveStream = require('./routes/liveStream');
const youtube = require('./youtube');

// NOTE: - Server config options
const { PORT, MONGODB_URI } = require('./config');

const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// passport
app.use(expressSession({
  secret: 'delivery kat',
  resave: true,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// use routes
app.use('/', index);
app.use('/auth', auth);
app.use('/liveStream', liveStream);

const db = monk(MONGODB_URI);
const userChatCollection = db.get('userChatMessages');

server.listen(PORT, (error) => {
  if (error) {
    process.exit(1);
  } else {
    console.log(`server running on port ${PORT}`);
  }
});

// TODO: - move this to another file
io.on('connection', (socket) => {
  console.log('Client connected...');

  // NOTE: - pass in one object instead of two
  async function createOrUpdateUserChatMessages(username, message) {
    try {
      const trimmedUsername = username.replace(/\s+/, '');
      const result = await userChatCollection.findOne({ username: trimmedUsername });

      if (result === null) {
        await userChatCollection.insert({ username: trimmedUsername, messages: [message] });
      } else {
        const { _id } = result;
        result.messages.push(message);
        const { messages } = result;
        const updateQuery = { $set: { messages } };
        await userChatCollection.update({ _id }, updateQuery);
      }

      return;
    } catch (err) {
      console.log(err);
    }
  }

  async function startPolling(liveChatId, nextPageToken, pollingIntervalMillis) {
    await setTimeout(async () => {
      try {
        const liveChatMessageData = await youtube.listLiveChatMessagesById(liveChatId, nextPageToken);
        const newNextPageToken = liveChatMessageData.nextPageToken;
        const newPollingInterval = liveChatMessageData.pollingIntervalMillis;
        const { items } = liveChatMessageData; // chatMessages

        items.forEach(async (item) => {
          const usernameWithMessage = {
            username: item.authorDetails.displayName,
            message: item.snippet.displayMessage,
          };
          await createOrUpdateUserChatMessages(usernameWithMessage.username, usernameWithMessage.message);
          socket.emit('new message', usernameWithMessage);
        });

        startPolling(liveChatId, newNextPageToken, newPollingInterval);
      } catch (err) {
        console.log(err);
      }
    }, pollingIntervalMillis);
  }

  socket.on('startPolling', async (data) => {
    const { videoId } = data;

    // time to get live chat messages
    const videoData = await youtube.listVideosById(videoId);
    const { activeLiveChatId } = videoData.items[0].liveStreamingDetails;
    startPolling(activeLiveChatId, '', 0);
  });

  socket.on('search', async (data) => {
    const { username } = data;
    const trimmedUsername = username.replace(/\s+/, '');
    const result = await userChatCollection.findOne({ username: trimmedUsername });

    socket.emit('searchResults', result);
  });
});
