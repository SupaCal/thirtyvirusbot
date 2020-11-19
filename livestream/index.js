var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;
const mongoose = require('mongoose');
const Superchat = require('./schemas/Superchat');
const Member = require('./schemas/Member');
const TwitchSub = require('./schemas/TwitchSub');
const ChatMessage = require('./schemas/ChatMessage');
require('dotenv').config();
mongoose.connect(
process.env.MONGO_URI
, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the YouTube API.
  authorize(JSON.parse(content), main);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function main(auth) {
  var service = google.youtube('v3');
  service.liveBroadcasts.list({auth: auth, part: 'snippet', mine: true}, (err, response) => {
    if(err){
      process.exit();
    }else if(response){
      if(response.data.items.length !== 0){
        global.lcid = response.data.items[0].snippet.liveChatId;
      }else{
        process.exit()
      }
    }
  })
  
  global.scintv = setInterval(() => {
    service.superChatEvents.list({auth: auth, part: 'snippet'}, (err, response) => {
        console.log(err)
        //console.log(response);
        for (let index = 0; index < response.data.items.length; index++) {
        const element = response.data.items[index];
        Superchat.findOne({scid: element.id}, (error, res) => {
          if(res == null){
            var superchat = new Superchat({scid: element.id, channelid: element.snippet.channelId})
            superchat.save()
          }
        })
      }
    })
  }, 60000)
  global.cmintv = setInterval(() => {
    if(global.lcid){
      service.liveChatMessages.list({auth: auth, part: 'snippet', liveChatId: global.lcid}, (err, response) => {
          console.log(response);
          for (let index = 0; index < response.data.items.length; index++) {
          const element = response.data.items[index];
          Superchat.findOne({scid: element.id}, (error, res) => {
            if(res == null){
              var chatmessage = new ChatMessage({cmid: element.id, channelid: element.snippet.authorDetails.channelId})
              chatmessage.save()
            }
          })
        }
      })
    }
  }, 60000)
  /*
  service.channels.list({
    auth: auth,
    part: 'snippet,contentDetails,statistics',
    forUsername: 'GoogleDevelopers'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var channels = response.data.items;
    if (channels.length == 0) {
      console.log('No channel found.');
    } else {
      console.log('This channel\'s ID is %s. Its title is \'%s\', and ' +
                  'it has %s views.',
                  channels[0].id,
                  channels[0].snippet.title,
                  channels[0].statistics.viewCount);
    }
  });
  */
}