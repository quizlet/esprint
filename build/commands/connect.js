'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connect = undefined;

var _child_process = require('child_process');

var _util = require('../util');

var _cliUtils = require('../cliUtils');

var _Client = require('../Client');

var _Client2 = _interopRequireDefault(_Client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var connect = exports.connect = function connect(options) {
  var args = [];
  for (var key in options) {
    args.push(`--${key}=${options[key]}`);
  }

  var port = options.port;

  (0, _util.isPortTaken)(port).then(function (isTaken) {
    // start the server if it isn't running
    var client = new _Client2.default(options);

    if (!isTaken) {
      var child = (0, _child_process.fork)(require.resolve('../startServer.js'), args, { silent: true });

      child.on('message', function (message) {
        if (message.server) {
          // Wait for the server to start before connecting
          client.connect();
        } else if (message.message) {
          (0, _cliUtils.clearLine)();
          process.stdout.write(message.message);
        }
      });
    } else {
      client.connect();
    }
  });
};