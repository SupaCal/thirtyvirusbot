var fs = require("fs");
var { google } = require("googleapis");
const { Client } = require("discord.js");
require("dotenv").config();

const youtube = google.youtube({ auth: process.env.GOOGLE_KEY, version: "v3" });

var config = JSON.parse(fs.readFileSync("config.json"));
var isReady = false;
var client = new Client();
client.on("ready", () => {
  isReady = true;
});
client.on("message", (msg) => {
  msg.channel.send();
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
      console.log(slevent);
      if (slevent.type === "donation") {
        console.log(slevent.message[0].name.toString());
        console.log(`Name = ${slevent.message[0].name.toString()}`);
        client.channels.cache
          .get("781325325417709629")
          .send(slevent.message[0].name.toString());
        //sendMessage('781325325417709629', slevent.message[0].from)
      }
      //sendMessage('781325325417709629', slevent)
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
