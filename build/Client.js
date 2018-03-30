'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dnode = require('dnode');

var _dnode2 = _interopRequireDefault(_dnode);

var _eslint = require('eslint');

var _cliUtils = require('./cliUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Client = function () {
  function Client(options) {
    _classCallCheck(this, Client);

    var port = options.port,
        formatter = options.formatter;

    var eslint = new _eslint.CLIEngine();
    this.port = port;
    this.formatter = eslint.getFormatter(formatter);
  }

  _createClass(Client, [{
    key: 'connect',
    value: function connect() {
      var d = _dnode2.default.connect(this.port);
      var formatter = this.formatter;
      d.on('remote', function (remote) {
        setInterval(function () {
          remote.status('', function (results) {
            if (!results.message) {
              d.end();
              console.log(formatter(results.records));
              process.exit(results && results.errorCount > 0 ? 1 : 0);
            } else {
              (0, _cliUtils.clearLine)();
              process.stdout.write(results.message);
            }
          });
        }, 1000);
      });
    }
  }]);

  return Client;
}();

exports.default = Client;