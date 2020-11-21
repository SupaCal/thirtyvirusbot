var fs = require("fs");
var readline = require("readline");
var { google } = require("googleapis");
var OAuth2 = google.auth.OAuth2;
const mongoose = require("mongoose");
const Superchat = require("./schemas/Superchat");
const Member = require("./schemas/Member");
const TwitchSub = require("./schemas/TwitchSub");
const ChatMessage = require("./schemas/ChatMessage");
const YTVideo = require("./schemas/YTVideo");
const discordsender = require("./discordsender");
const { Client } = require("discord.js");
require("dotenv").config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ["https://www.googleapis.com/auth/youtube.readonly"];
var TOKEN_DIR =
  (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) +
  "/.credentials/";
var TOKEN_PATH = TOKEN_DIR + "youtube-nodejs-quickstart.json";

// Load client secrets from a local file.
fs.readFile("client_secret.json", function processClientSecrets(err, content) {
  if (err) {
    console.log("Error loading client secret file: " + err);
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
  fs.readFile(TOKEN_PATH, function (err, token) {
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
    access_type: "offline",
    scope: SCOPES,
  });
  if(process.env.YT_TOKEN){
    oauth2Client.getToken(process.env.YT_TOKEN, function (err, token) {
      if (err) {
        console.log("Error while trying to retrieve access token", err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  }else{
    console.log("Authorize this app by visiting this url: ", authUrl);
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Enter the code from that page here: ", function (code) {
      rl.close();
      oauth2Client.getToken(code, function (err, token) {
        if (err) {
          console.log("Error while trying to retrieve access token", err);
          return;
        }
        oauth2Client.credentials = token;
        storeToken(token);
        callback(oauth2Client);
      });
    });
  }
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
    if (err.code != "EEXIST") {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log("Token stored to " + TOKEN_PATH);
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function main(auth) {
  var isReady = false;
  var client = new Client();
  client.on("ready", () => {
    isReady = true;
    //client.channels.cache.get('779579757260046366').messages.fetch('779790841299599402').then(message => console.log(message.content)).catch(console.error);
    //match(/-(\r\n|\r|\n)https:\/\/www\.youtube\.com\/watch\?v=(.+)/g)[1])
  });
  client.on('message', (msg) => {
    service.videos.list({auth: auth, id: msg.content.match(/https:\/\/www\.youtube\.com\/watch\?v=(.+)/g)[1], part: 'snippet'}, (err, response) => {
      var desc = response.data.items[0].snippet.description;
      if(desc.includes('*this is a stream*')){
        newStream(msg.content)
      }else{
        newVideo(msg.content)
      }
    })
    ;
  })
  function sendMessage(chid, msg){
    if(isReady){
      client.channels.cache.get(chid).send(msg)
    }
  }
  function newVideo (url){
    sendMessage('779804200842035230', url)
  }
  function newStream (url){
    sendMessage('779804181787181096', url)
  }
  var liveStreamStarted;
  var service = google.youtube("v3");
  
  

  

  client.login(process.env.BOT_TOKEN)
  
}
