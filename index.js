'use strict'

const { App, ExpressReceiver } = require("@slack/bolt");
var _ = require("lodash");
var events = [];

const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  // The `processBeforeResponse` option is required for all FaaS environments.
  // It allows Bolt methods (e.g. `app.message`) to handle a Slack request
  // before the Bolt framework responds to the request (e.g. `ack()`). This is
  // important because FaaS immediately terminate handlers after the response.
  processBeforeResponse: true,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: expressReceiver
});

// Global error handler
app.error(console.log);

app.event("channel_created", ({ event, context }) => {
  try {
    if (!_.includes(events, event.channel.id)) {
      const result = app.client.chat.postMessage({
        token: context.botToken,
        channel: process.env.SLACK_CHANNEL_ID,
        text: `A new channel was created: <#${event.channel.id}> 🎉`
      });
      console.log(result);
      events.push(event.channel.id);
    } else {
      console.log("Event already processed.");
    }
  } catch (error) {
    console.error(error);
  }
});

app.event("channel_shared", ({ event, context }) => {
  try {
    if (!_.includes(events, event.channel)) {
      const result = app.client.chat.postMessage({
        token: context.botToken,
        channel: process.env.SLACK_CHANNEL_ID,
        text: `A new channel was shared: <#${event.channel}>`
      });
      console.log(result);
      events.push(event.channel);
    } else {
      console.log("Event already processed.");
    }
  } catch (error) {
    console.error(error);
  }
});

exports.run = expressReceiver.app;

// (async () => {
//     // Start your app
//     await app.start(process.env.PORT || 3000);
  
//     console.log("⚡️ Bolt app is running!");
//   })();
