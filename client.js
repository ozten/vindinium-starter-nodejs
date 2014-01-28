#!/usr/bin/env node

var request = require('request');
var qs = require('qs');

var randomBot = require('./bot');

function start(serverUrl, key, mode, numTurns, bot, cb) {
  var state;
  if ('arena' === mode) {
    console.log('Connected and waiting for other players to join...');
  }
  getNewGameState(serverUrl, key, mode, numTurns, function(err, state) {
    if (err) {
      console.log("ERROR starting game:", err);
      return cb();
    }
    console.log('Playing at:', state['viewUrl']);

    loop(key, state, bot, cb);
  });
}

function getNewGameState(serverUrl, key, mode, numTurns, cb) {
  var params = {
    key: key
  };
  var apiEndpoint = '/api/arena';
  if ('training' === mode) {
    params.turns = numTurns;
    // Comment out map parameter for a random map
    params.map = 'm1';
    apiEndpoint = '/api/training';
  }
  request.post({
    url: serverUrl + apiEndpoint,
    body: qs.stringify(params),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }, function(err, res, body) {
    if (err || 200 !== res.statusCode) {
      cb(err || "Unable to start new game status code: " + res.statusCode +
        " " + body);
    } else {
      cb(null, JSON.parse(new Buffer(body, 'utf8').toString('utf8')));
    }
  });
}

function loop(key, state, bot, cb) {

  if (isFinished(state)) {
    cb();
  } else {
    process.stdout.write('.');
    var url = state['playUrl'];
    bot(state, function(dir) {
      state = move(url, key, dir, function(err, newState) {
        if (err) {
          console.log('ERROR:', err);
          cb();
        } else {
          loop(key, newState, bot, cb);
        }
      });
    });
  }
}

function isFinished(state) {
  return state && !! state.game &&
    true === state['game']['finished'];
}

function move(url, key, direction, cb) {
  request.post({
    url: url,
    body: qs.stringify({
      key: key,
      dir: direction
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }, function(err, res, body) {
    if (err || 200 !== res.statusCode) {
      cb(err || 'Unable to move status code:' + res.statusCode + ' ' + body);
    } else {
      cb(null, JSON.parse(new Buffer(body, 'utf8').toString('utf8')));
    }

  });
}

function usage() {
  console.log('Usage: client.js <key> <[training|arena]> <number-of-games|number-of-turns> [server-url]');
  console.log('Example: client.js mySecretKey training 20');
}

var argv = process.argv;
if (6 < argv.length) {
  usage();
  process.exit(1);
}
var key = argv[2];
var mode = argv[3];

var numberOfGames = parseInt(argv[4], 10);
var numberOfTurns = 300; // Ignored in arena mode

if ('training' === mode) {
  numberOfGames = 1;
  numberOfTurns = parseInt(argv[4], 10);
}

var serverUrl = 'http://vindinium.org';
if (6 === argv.length) {
  serverUrl = argv[5];
}

var i = 0;

function playGame() {
  start(serverUrl, key, mode, numberOfTurns, randomBot, function() {
    console.log('Game Finished:', i + 1, '/', numberOfGames);
    i++;
    if (i < numberOfGames) {
      playGame();
    }
  });
}

playGame();