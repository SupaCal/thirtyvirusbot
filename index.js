var fs = require("fs");
var { google } = require("googleapis");
const { Client, MessageEmbed } = require("discord.js");
require("dotenv").config();

const youtube = google.youtube({ auth: process.env.GOOGLE_KEY, version: "v3" });

var config = JSON.parse(fs.readFileSync("config.json"));
var isReady = false;
var client = new Client();
client.on("ready", () => {
  isReady = true;
 
  
});
client.on("message", (msg) => {
  if (msg.channel.id == config.channelids.mee6) {
    var vdid = msg.content.match(
      /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    //console.log(vdid);
    if (vdid) {
      var link = "https://" + vdid[0];
      youtube.videos.list({ id: vdid[1], part: "snippet" }, (err, response) => {
        //console.log(err);
        var desc = response.data.items[0].snippet.description;
        if (desc.includes("*this is a stream*")) {
          isLive(vdid[1]).then((islive) => {
            if (islive) {
              newStream(link);
            } else {
              global.ytstream = setInterval(() => {
                isLive(vdid[1]).then((data) => {
                  if (data) {
                    clearInterval(global.ytstream);
                    newStream(link);
                  }
                });
              }, 60000);
            }
          });
        } else {
          newVideo(link);
        }
      });
    }
  }
});

if (config.streamlabs.enabled) {
  if (process.env.WS_KEY) {
    var streamlabs = require("socket.io-client")(
      `https://sockets.streamlabs.com?token=${process.env.WS_KEY}`
    );
    streamlabs.on("event", (slevent) => {
      switch (slevent.type){
        case 'subscription':
          if(slevent.for === 'twitch_account'){
            sendMessage(config.channelids.donos, new MessageEmbed().setTitle('Thanks for the subscription ' + slevent.message[0].name).setColor('#8400FF').addFields({name: 'Message', value: slevent.message[0].message}, {name: 'Months', value: slevent.message[0].months}))
          }else if(slevent.for === 'youtube_account'){
            sendMessage(config.channelids.donos, new MessageEmbed().setTitle('Thanks for becoming a member ' + slevent.message[0].name).setColor('#FF0000').addFields({name: 'Months', value: slevent.message[0].months}))
          }
          break;
        case 'donation':
          sendMessage(config.channelids.donos, new MessageEmbed().setTitle('Thanks for donating ' + slevent.message[0].from).setColor('#80F5D2').addFields({name: 'Amount', value: slevent.message[0].formatted_amount}, {name: 'Message', value: slevent.message[0].message}))
          break;
        case 'superchat':
          if(slevent.message[0].comment){
            sendMessage(config.channelids.donos, new MessageEmbed().setTitle('Thank you for the Superchat ' + slevent.message[0].name).setColor('#FF0000').addFields({name: 'Message', value: slevent.message[0].comment}, {name: 'Amount', value: slevent.message[0].displayString}))
          }
          break;
        default:
          break;
      }
      console.log(slevent)
      
    });
  } else console.log("No Streamlabs websocket key provided");
}

function sendMessage(chid, msg) {
  if (isReady) {
    console.log("sendmessage called");
    client.channels.cache.get(chid).send(msg);
  }
}
function newVideo(url) {
  sendMessage(
    config.channelids.videos,
    "ThirtyVirus posted a video! <@&" + config.roleids.videos + "> " + url
  );
}
function newStream(url) {
  sendMessage(
    config.channelids.streams,
    "ThirtyVirus has gone live! <@&" + config.roleids.streams + "> " + url
  );
}
async function isLive(vdid) {
  var vid = await youtube.videos.list({ id: vdid, part: "snippet" });

  if (vid.data.items[0].snippet.liveBroadcastContent == "upcoming") {
    return false;
  } else {
    return true;
  }
}

client.login(process.env.BOT_TOKEN);
