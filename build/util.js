'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findFile = exports.isPortTaken = exports.flatten = exports.promisify = undefined;

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var promisify = exports.promisify = function promisify(fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    return new Promise(function (resolve, reject) {
      args.push(function (err, res) {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });

      fn.apply(this, args);
    });
  };
};

var flatten = exports.flatten = function flatten(array) {
  return array.reduce(function (acc, curr) {
    return curr.concat(acc);
  }, []);
};

var isPortTaken = exports.isPortTaken = function isPortTaken(port) {
  return new Promise(function (resolve, reject) {
    var tester = _net2.default.createServer().once('error', function (err) {
      if (err.code !== 'EADDRINUSE') return reject(err);
      resolve(true);
    }).once('listening', function () {
      tester.once('close', function () {
        resolve(false);
      }).close();
    }).listen(port);
  });
};

/*
 * Walks up a directory until a file is found.
 * @return path - the path where the fileName is found
 */
var findFile = exports.findFile = function findFile(fileName) {
  for (var curDir = process.cwd(); curDir !== '/'; curDir = _path2.default.resolve(curDir, '..')) {
    var filepath = _path2.default.join(curDir, fileName);
    if (_fs2.default.existsSync(filepath)) {
      return filepath;
    }
  }
  return '';
};