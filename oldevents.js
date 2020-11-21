service.liveBroadcasts.list(
    { auth: auth, part: "snippet", mine: true },
    (err, response) => {
      if (err) {
        process.exit();
      } else if (response) {
        if (response.data.items.length !== 0) {
          global.lcid = response.data.items[0].snippet.liveChatId;
        } else {
          
        }
      }
    }
  );
  global.scintv = setInterval(() => {
    if(liveStreamStarted){
      service.superChatEvents.list(
        { auth: auth, part: "snippet" },
        (err, response) => {
          console.log(err);
          //console.log(response);
          for (let index = 0; index < response.data.items.length; index++) {
            const element = response.data.items[index];
            Superchat.findOne({ scid: element.id }, (error, res) => {
              if (res == null) {
                var superchat = new Superchat({
                  scid: element.id,
                  channelid: element.snippet.channelId,
                });
                superchat.save();
              }
            });
          }
        }
      );
    }
  }, 60000);
  global.cmintv = setInterval(() => {
    if(liveStreamStarted){
      if (global.lcid) {
        service.liveChatMessages.list(
          { auth: auth, part: "snippet", liveChatId: global.lcid },
          (err, response) => {
            console.log(response);
            for (let index = 0; index < response.data.items.length; index++) {
              const element = response.data.items[index];
              Superchat.findOne({ scid: element.id }, (error, res) => {
                if (res == null) {
                  var chatmessage = new ChatMessage({
                    cmid: element.id,
                    channelid: element.snippet.authorDetails.channelId,
                  });
                  chatmessage.save().then((doc) => {
                    discordstuff.newVideo;
                  });
                }
              });
            }
          }
        );
      }
    }
  }, 60000);
  global.vdintv = setInterval(() => {
    service.search.list(
      { auth: auth, part: "snippet", order: "date", channelId: 'UC04QdEl71CFDogk8pzY7Geg', type: "video", maxResults: 5},
      (err, response) => {
        //console.log(response);
        for (let index = 0; index < response.data.items.length; index++) {
          const element = response.data.items[index];
          YTVideo.findOne({ vdid: element.id.videoId }, (error, res) => {
            console.log(res)
            if (res == null) {
              var ytvideo = new YTVideo({
                vdid: element.id.videoId,
                name: element.snippet.title,
                description: element.snippet.description
              });
              ytvideo.save().then((doc) => {
                discordstuff.newVideo('https://www.youtube.com/watch?v=' + doc.vdid);
              });
            }
          });
        }
      }
    );
  }, 600000);