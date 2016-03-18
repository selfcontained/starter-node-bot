var Botkit = require('botkit')
var BeepBoop = require('beepboop-botkit')

var controller = Botkit.slackbot()

// If we have a SLACK_TOKEN env var - assume we're operating in single team mode
var slackToken = process.env.SLACK_TOKEN

if (slackToken) {
  controller
    .spawn({
      token: slackToken
    }).startRTM(function (err, bot, payload) {
      if (err) {
        throw new Error('Could not connect to Slack')
      }
    })
} else {
  // Otherwise we're running in multi-team mode w/ connection to BeepBoop
  // Events are triggered when teams are added/removed and slack rtm connections are spawned
  var beepboop = BeepBoop.start(controller, {
    debug: true
  })

  beepboop
    // You can react to multiple events, like when teams add/remove your bot
    .on('open', function () {
      console.log('Websocket connection to BeepBoop opened')
    })
    .on('close', function () {
      console.log('Websocket connection to BeepBoop closed')
    })
    .on('add_resource', function (message) {
      console.log('Team added: %s', message.resource.SlackTeamID)
    })
    .on('update_resource', function (message) {
      console.log('Team updated: %s', message.resource.SlackTeamID)
    })
    // You would receive this event if a team updated their team-specific configuration
    .on('remove_resource', function (message) {
      console.log('Team removed: %s', message.resourceId)
    })
    .on('error', function (err) {
      console.log(err)
    })
}

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "I'm here!")
})

controller.hears(['hello', 'hi'], ['direct_mention'], function (bot, message) {
  bot.reply(message, 'Hello.')
})

controller.hears(['hello', 'hi'], ['direct_message'], function (bot, message) {
  bot.reply(message, 'Hello.')
  bot.reply(message, 'It\'s nice to talk to you directly.')
})

controller.hears('.*', ['mention'], function (bot, message) {
  bot.reply(message, 'You really do care about me. :heart:')
})

controller.hears('help', ['direct_message', 'direct_mention'], function (bot, message) {
  var help = 'I will respond to the following messages: \n' +
      '`bot hi` for a simple message.\n' +
      '`bot attachment` to see a Slack attachment message.\n' +
      '`@<your bot\'s name>` to demonstrate detecting a mention.\n' +
      '`bot help` to see this again.'
  bot.reply(message, help)
})

controller.hears(['attachment'], ['direct_message', 'direct_mention'], function (bot, message) {
  var text = 'Beep Beep Boop is a ridiculously simple hosting platform for your Slackbots.'
  var attachments = [{
    fallback: text,
    pretext: 'We bring bots to life. :sunglasses: :thumbsup:',
    title: 'Host, deploy and share your bot in seconds.',
    image_url: 'https://storage.googleapis.com/beepboophq/_assets/bot-1.22f6fb.png',
    title_link: 'https://beepboophq.com/',
    text: text,
    color: '#7CD197'
  }]

  bot.reply(message, {
    attachments: attachments
  }, function (err, resp) {
    console.log(err, resp)
  })
})

controller.hears('.*', ['direct_message', 'direct_mention'], function (bot, message) {
  bot.reply(message, 'Sorry <@' + message.user + '>, I don\'t understand. \n')
})
