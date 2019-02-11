const Twit = require('twit');

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
 * Posting functions
 */
const postText = (message, callback) => {
  T.post('statuses/update', { status: message }, (err, data, response) => {
    if (data) {
      const tweetUrl =
        'https://twitter.com/' +
        data.user.screen_name +
        '/status/' +
        data.id_str;
      const result = {
        success: true,
        url: tweetUrl,
        error: null
      };
      callback(result);
      return;
    }
    if (err) {
      const result = {
        success: false,
        url: null,
        error: err
      };
      callback(result);
      return;
    }
    return;
  });
};

const postPhoto = (message, b64content, callback) => {
  T.post('media/upload', { media_data: b64content }, function(
    err,
    data,
    response
  ) {
    var mediaIdStr = data.media_id_string;
    var altText = 'Small flowers in a planter on a sunny balcony, blossoming.';
    var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } };

    T.post('media/metadata/create', meta_params, function(err, data, response) {
      if (!err) {
        var params = {
          status: message,
          media_ids: [mediaIdStr]
        };

        T.post('statuses/update', params, function(err, data, response) {
          if (data) {
            const tweetUrl =
              'https://twitter.com/' +
              data.user.screen_name +
              '/status/' +
              data.id_str;
            const result = {
              success: true,
              url: tweetUrl,
              error: null
            };
            callback(result);
          }
          if (err) {
            const result = {
              success: false,
              url: null,
              error: err
            };
            callback(result);
            return;
          }
        });
      }
    });
  });
};

module.exports = {
  postText: postText,
  postPhoto: postPhoto
};
