const Twit = require('twit');
const TeleBot = require('telebot');
const request = require('request');
const fs = require('fs');

/**
 * downlaod function
 */
const download = function(uri, filename, callback) {
  request.head(uri, function(err, res, body) {
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);
    request(uri)
      .pipe(fs.createWriteStream(filename))
      .on('close', callback);
  });
};

/**
 * Config for bot
 */
const telegramBotToken = require('./config/telegram-bot-token');
const bot = new TeleBot(telegramBotToken.token);

/**
 * Config for twit
 */
const twitterTokens = require('./config/twitter-tokens');
const T = new Twit({
  consumer_key: twitterTokens.consumer_key,
  consumer_secret: twitterTokens.consumer_secret,
  access_token: twitterTokens.access_token,
  access_token_secret: twitterTokens.access_token_secret
});

/**
 * Cloud of hastags
 */
const hashTags = [
  '#hegdetrading',
  '#wallstreet',
  '#forexsignals',
  '#money',
  '#moneymaker',
  '#financialfreedom',
  '#forex'
];

/**
 * Twitter functions
 */

const publishTweetText = (text, telegramInstance) => {
  telegramInstance.reply.text('Publishng in social media, wait few seconds...');
  let tweetMessage = text;

  hashTags.forEach(tag => {
    tweetMessage = tweetMessage + ' ' + tag;
  });

  console.log(tweetMessage);

  T.post('statuses/update', { status: text }, (err, data, response) => {
    if (data) {
      const tweetUrl =
        'https://twitter.com/' +
        data.user.screen_name +
        '/status/' +
        data.id_str;
      telegramInstance.reply.text('Published on Twitter! - ' + tweetUrl);
      console.log(data);
    }
    if (err) {
      telegramInstance.reply.text(
        'Error on publish on Twitter!:, try again please'
      );
    }
  });
};

/**
 * Bot welcome and bot commands
 */
const commands = ['/start'];

bot.on(commands, msg =>
  msg.reply.text(
    "Welcome, send me a text, image or both and I'm going to publish on Social Media!"
  )
);

/**
 * Bot text message
 */
bot.on(['text'], msg => {
  // console.log(msg);
  if (commands.includes(msg.text)) {
    return;
  }

  publishTweetText(msg.text, msg);
});

/**
 * Image and text
 */

bot.on(['photo', 'forward'], msg => {
  if (msg.photo == undefined) {
    publishTweetText(msg.text, msg);
    return;
  }
  let getFileUrl =
    'https://api.telegram.org/bot' +
    telegramBotToken.token +
    '/getFile?file_id=';

  let fileImageUrl =
    'https://api.telegram.org/file/bot' + telegramBotToken.token + '/';
  let id = msg.chat.id;
  bot.sendMessage(id, `Adding the Post...`);
  console.log(msg);
  if (!msg.photo) {
    return;
  }
  getFileUrl = getFileUrl + msg.photo[2].file_id;
  console.log(getFileUrl);

  request(getFileUrl, function(error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    const result = JSON.parse(body);
    if (result.ok === false) {
      return bot.sendMessage(
        id,
        `There is a error adding the watermark, try again please.`
      );
    }
    fileImageUrl = fileImageUrl + result.result.file_path;
    console.log(fileImageUrl);

    download(fileImageUrl, './images/downloadedPostImage.png', () => {
      /* twitter part */
      var b64content = fs.readFileSync('./images/downloadedPostImage.png', {
        encoding: 'base64'
      });
      T.post('media/upload', { media_data: b64content }, function(
        err,
        data,
        response
      ) {
        // now we can assign alt text to the media, for use by screen readers and
        // other text-based presentations and interpreters
        var mediaIdStr = data.media_id_string;
        var altText =
          'Small flowers in a planter on a sunny balcony, blossoming.';
        var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } };

        T.post('media/metadata/create', meta_params, function(
          err,
          data,
          response
        ) {
          if (!err) {
            // now we can reference the media and post a tweet (media will attach to the tweet)
            var params = {
              status: msg.caption,
              media_ids: [mediaIdStr]
            };

            T.post('statuses/update', params, function(err, data, response) {
              if (response.status == '200 OK') {
                msg.reply.text('Published on Twitter! ' + data.url);
              }
              if (err) {
                msg.reply.text(
                  'Error on publish on Twitter!, try again please'
                );
              }
            });
          }
        });
      });
    });
  });
});

/**
 * Init of bot
 */
bot.start();
