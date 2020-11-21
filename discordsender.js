const { Client } = require("discord.js");

require("dotenv").config();
class DiscordSender {
  isReady = false;
  setReady(bool) {
    this.isReady = bool;
  }
  constructor() {
    this.startClient();
  }
  startClient() {
    this.client = new Client();
    this.client.on("ready", () => {
      this.isReady = true;
    });
    this.client.login(process.env.BOT_TOKEN);
  }
  newVideo(link) {
    if (this.isReady) {
      this.client.channels.cache.get('576188537356025869').send(link)
    }
  }
}



module.exports = DiscordSender;