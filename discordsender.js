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
      isReady = true;
    });
  }
  newVideo() {
    if (this.isReady) {
      this.client.channels.cache.get('').send('hi')
    }
  }
}

client.login(process.env.BOT_TOKEN);
