'use strict';

var _Server = require('./Server');

var _Server2 = _interopRequireDefault(_Server);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

new _Server2.default(_yargs2.default.argv);