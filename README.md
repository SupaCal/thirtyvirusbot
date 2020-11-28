# thirtyvirusbot

A Discord bot that differentiates YouTube streams from videos

Progress: https://trello.com/b/Zkn4IIVa/bot

Instructions:
  - Enviormental variables: 
    - GOOGLE_KEY: Google api key with youtube api enabled
    - WS_KEY: Streamlabs websocket key (only applicable if streamlabs is enabled)
    - BOT_TOKEN: Discord bot token
   - The config.json file consists of a lot of different discord channel ids for the input video links
      - channelids.mee6: Basically the input channel id 
      - channelids.videos and channelids.streams: The output channel ids
      - channelids.donos: donation channel id (only applicable if streamlabs is enabled)
      - roleids.videos and streams: the corosponding roles to ping
      - streamlabs.enabled: whether dono messages are enabled
