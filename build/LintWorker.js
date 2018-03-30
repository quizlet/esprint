'use strict';

var _eslint = require('eslint');

var eslint = new _eslint.CLIEngine({ cwd: process.cwd() });

var lintFile = function lintFile(fileArg) {
  if (!Array.isArray(fileArg)) {
    fileArg = [fileArg];
  }
  var report = eslint.executeOnFiles(fileArg);
  return report.results;
};

module.exports = function (options, callback) {
  var results = lintFile(options.fileArg);
  if (options.suppressWarnings) {
    callback(null, _eslint.CLIEngine.getErrorResults(results));
  } else {
    callback(null, results);
  }
};