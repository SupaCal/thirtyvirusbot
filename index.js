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
  var config = JSON.parse(fs.readFileSync('discconfig.json'));
  var isReady = false;
  var client = new Client();
  let re = new RegExp('(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)')
  client.on("ready", () => {
    isReady = true;
    //client.channels.cache.get('779579757260046366').messages.fetch('779790841299599402').then(message => console.log(message.content)).catch(console.error);
    //match(/-(\r\n|\r|\n)https:\/\/www\.youtube\.com\/watch\?v=(.+)/g)[1])
  });
  client.on('message', (msg) => {
    if(msg.channel.id == config.channelids.mee6){
      if(msg.content.includes('youtube.com')){
        var vdid = msg.content.match(/(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
        //console.log(vdid);
        var link = 'http://' + vdid[0]
        service.videos.list({auth: auth, id: vdid[1], part: 'snippet'}, (err, response) => {
          //console.log(err);
          var desc = response.data.items[0].snippet.description;
          if(desc.includes('*this is a stream*')){
            if(isLive(vdid[1])){
              
            }else {
              global[vdid[1]] = setInterval(() => {
                if(isLive(vdid[1])){
                  newStream(link)
                  clearInterval(global[vdid[1]])
                }
              }, 60000)
            }
            console.log(response.data.items[0].snippet)
            
          }else{
            newVideo(link)
          }
        });
      }
    }
  })
  //if()

  function sendMessage(chid, msg){
    if(isReady){
      client.channels.cache.get(chid).send(msg)
    }
  }
  function newVideo (url){
    sendMessage(config.channelids.videos, 'ThirtyVirus posted a video! <@&'+ config.roleids.videos +'> ' + url)
  }
  function newStream (url){
    sendMessage(config.channelids.streams, 'ThirtyVirus has gone live! <@&'+ config.roleids.streams +'> ' + url)
  }
  function isLive(vdid){
    service.videos.list({auth: auth, id: vdid, part: 'snippet'}, (err, response) => {
      if(response.data.items[0].snippet.liveBroadcastContent == "upcoming") return false
      else return true
    })
  }
  var liveStreamStarted;
  var service = google.youtube("v3");
  
  

  

  client.login(process.env.BOT_TOKEN)
  
}
