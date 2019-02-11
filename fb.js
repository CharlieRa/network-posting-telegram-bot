const FB = require('fb');
const facebbokTokens = require('./config/facebook-token');

/* curl -X GET "https://graph.facebook.com/your-endpoint?key=value&access_token=your-app_id|your-app_secret" */
const getAccessToken = callback => {
  FB.api(
    'oauth/access_token',
    'GET',
    {
      client_id: facebbokTokens.client_id,
      client_secret: facebbokTokens.client_secret,
      grant_type: facebbokTokens.grant_type
    },
    response => {
      if (response.error) {
        const result = {
          success: false,
          url: null,
          error: response.error,
          response: response
        };
        callback(result);
        return;
      }

      const result = {
        success: true,
        url: null,
        error: null,
        response: response
      };

      FB.setAccessToken(response.access_token);

      callback(result);
      return;
    }
  );
};

const getAccounts = callback => {
  FB.api('me/accounts', 'GET', {}, response => {
    if (response.error) {
      const result = {
        success: false,
        url: null,
        error: response.error,
        response: response
      };
      callback(result);
      return;
    }

    const result = {
      success: true,
      url: null,
      error: null,
      response: response
    };

    console.log(response);

    callback(result);
    return;
  });
};

const postText = (message, callback) => {
  FB.api('/242366906451571/feed', 'POST', { message: message }, response => {
    if (response.error) {
      const result = {
        success: false,
        url: null,
        error: response.error,
        response: response
      };
      callback(result);
      return;
    }

    const url = 'https://www.facebook.com/' + response.id;

    const result = {
      success: true,
      url: url,
      error: null,
      response: response
    };

    callback(result);
    return;
  });
};

const postPhoto = (message, caption, url, callback) => {
  FB.api(
    '/242366906451571/photos',
    'POST',
    {
      message: message,
      caption: caption,
      url: url
    },
    response => {
      if (response.error) {
        const result = {
          success: false,
          url: null,
          error: response.error,
          response: response
        };
        callback(result);
        return;
      }

      const url = 'https://www.facebook.com/' + response.post_id;

      const result = {
        success: true,
        url: url,
        error: null,
        response: response
      };

      callback(result);
      return;
    }
  );
};

module.exports = {
  postText: postText,
  postPhoto: postPhoto,
  getAccessToken: getAccessToken,
  getAccounts: getAccounts
};
