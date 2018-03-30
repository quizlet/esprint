'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _workerFarm = require('worker-farm');

var _workerFarm2 = _interopRequireDefault(_workerFarm);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LintRunner = function () {
  function LintRunner(numThreads, suppressWarnings) {
    _classCallCheck(this, LintRunner);

    var workers = (0, _workerFarm2.default)({
      autoStart: true,
      maxConcurrentCallsPerWorker: Infinity,
      maxConcurrentWorkers: numThreads
    }, require.resolve('./LintWorker'));

    this.workers = (0, _util.promisify)(workers);
    this.suppressWarnings = suppressWarnings;
  }

  _createClass(LintRunner, [{
    key: 'run',
    value: function run(files) {
      var that = this;
      return Promise.all(files.map(function (file) {
        return that.workers({
          fileArg: file,
          suppressWarnings: that.suppressWarnings
        });
      })).then(function (results) {
        var records = (0, _util.flatten)(results);

        // produce a sum of total num of errors/warnings

        var _records$reduce = records.reduce(function (a, b) {
          return {
            errorCount: a.errorCount + b.errorCount,
            warningCount: a.warningCount + b.warningCount
          };
        }, { errorCount: 0, warningCount: 0 }),
            errorCount = _records$reduce.errorCount,
            warningCount = _records$reduce.warningCount;

        return {
          records,
          errorCount,
          warningCount
        };
      }).catch(function (e) {
        console.error(e.stack);
        process.exit(1);
      });
    }
  }]);

  return LintRunner;
}();

exports.default = LintRunner;