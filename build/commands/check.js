'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.check = undefined;

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _eslint = require('eslint');

var _LintRunner = require('../LintRunner');

var _LintRunner2 = _interopRequireDefault(_LintRunner);

var _util = require('../util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var check = exports.check = function check(options) {
  var workers = options.workers,
      paths = options.paths,
      formatter = options.formatter,
      rcPath = options.rcPath,
      quiet = options.quiet;


  var lintRunner = new _LintRunner2.default(workers, !!quiet);
  var rcDir = _path2.default.dirname(rcPath);
  var eslint = new _eslint.CLIEngine({ cwd: rcDir });

  var filePaths = (0, _util.flatten)(paths.map(function (globPath) {
    return _glob2.default.sync(globPath, { cwd: rcDir, absolute: true });
  }));
  // filter out the files that we tell eslint to ignore
  var nonIgnoredFilePaths = filePaths.filter(function (filePath) {
    return !(eslint.isPathIgnored(filePath) || filePath.indexOf('eslint') !== -1);
  });

  lintRunner.run(nonIgnoredFilePaths).then(function (results) {
    var records = results.records.filter(function (record) {
      return record.warningCount > 0 || record.errorCount > 0;
    });

    var lintFormatter = eslint.getFormatter(formatter);
    console.log(lintFormatter(records));
    process.exit(results && results.errorCount > 0 ? 1 : 0);
  });
};