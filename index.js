const TeleBot = require('telebot');
const request = require('request');
const fs = require('fs');
const facebookPosting = require('./fb');
const twitterPosting = require('./twitter');

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
 * download function
 */
const download = (uri, filename, callback) => {
  request.head(uri, function(err, res, body) {
    request(uri)
      .pipe(fs.createWriteStream(filename))
      .on('close', callback);
  });
};

/**
 * Add hastags function
 */

const addHashtags = message => {
  hashTags.forEach(tag => {
    message = message + ' ' + tag;
  });
  return message;
};

/**
 * Config for bot
 */
const telegramBotToken = require('./config/telegram-bot-token');
const bot = new TeleBot(telegramBotToken.token);

/**
 * @TODO
 */
/* Facebook generate access token */
// facebookPosting.getAccessToken(loginResult => {
//   console.log(loginResult);
// });

/**
 * Bot welcome and bot commands
 */
const commands = ['/start'];

bot.on(commands, msg => {
  msg.reply.text(
    "Welcome, send me a text, image with a caption or forwarded message and I'm going to publish on Twitter and Facebook!"
  );
  /**
   * @TODO
   */
  facebookPosting.getAccounts(loginResult => {
    console.log(loginResult);
  });
});

/**
 * Bot text message
 */
bot.on(['text'], msg => {
  if (commands.includes(msg.text)) {
    return;
  }

  /**
   * @TODO
   */
  /* Facebook posting */
  // facebookPosting.postText(msg.text, result => {
  //   console.log('result fb', result);

  //   if (result.success == true) {
  //     msg.reply.text('Published on Facebook! - ' + resultFB.url);
  //   } else {
  //     msg.reply.text('Error to publish on Facebook!, try again please');
  //   }
  // });

  /* Twitter posting */
  twitterResult = twitterPosting.postText(msg.text, result => {
    console.log('result twitter', result);
    if (result.success == true) {
      msg.reply.text('Published on Twitter! - ' + result.url);
    } else {
      msg.reply.text('Error on publish on Twitter!, try again please');
    }
  });
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
  bot.sendMessage(id, `Adding Posts, wait a few seconds...`);
  if (!msg.photo) {
    return;
  }
  getFileUrl = getFileUrl + msg.photo[2].file_id;

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

    /**
     * TODO
     */
    /* Facebool posting */
    // facebookPosting.postPhoto(
    //   msg.caption,
    //   'Super Photo',
    //   fileImageUrl,
    //   resultFB => {
    //     console.log('result fb', resultFB);

    //     if (resultFB.success == true) {
    //       msg.reply.text('Published on Facebook! - ' + resultFB.url);
    //     } else {
    //       msg.reply.text('Error on publish on Facebook!:, try again please');
    //     }
    //   }
    // );

    /* Twitter Posting */
    download(fileImageUrl, './images/downloadedPostImage.png', () => {
      var b64content = fs.readFileSync('./images/downloadedPostImage.png', {
        encoding: 'base64'
      });

      twitterPosting.postPhoto(msg.caption, b64content, resultTwitter => {
        console.log('result twitter', resultTwitter);
        if (resultTwitter.success == true) {
          msg.reply.text('Published on Twitter! - ' + resultTwitter.url);
        } else {
          msg.reply.text('Error on publish on Twitter!:, try again please');
        }
      });
    });
  });
});

/**
 * Init of bot
 */
bot.start();
