'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dnode = require('dnode');

var _dnode2 = _interopRequireDefault(_dnode);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _sane = require('sane');

var _sane2 = _interopRequireDefault(_sane);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _LintRunner = require('./LintRunner');

var _LintRunner2 = _interopRequireDefault(_LintRunner);

var _eslint = require('eslint');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ROOT_DIR = process.cwd();

var eslint = new _eslint.CLIEngine({ cwd: ROOT_DIR });

var Server = function () {
  function Server(options) {
    var _this = this;

    _classCallCheck(this, Server);

    var workers = options.workers,
        port = options.port,
        paths = options.paths,
        ignored = options.ignored,
        rcPath = options.rcPath,
        quiet = options.quiet;


    this.port = port;
    this.rcPath = rcPath;

    this.cache = {};
    this.filesToProcess = 0;
    this.lintRunner = new _LintRunner2.default(workers, !!quiet);

    var rootDir = _path2.default.dirname(this.rcPath);

    this._setupWatcher(rootDir, paths.split(','), ignored.split(','));

    var server = (0, _dnode2.default)({
      status: function status(param, cb) {
        if (_this.filesToProcess === 0) {
          return cb(_this.getResultsFromCache());
        } else {
          return cb({ message: `Linting...${_this.filesToProcess} left to lint` });
        }
      }
    });

    process.send({ server: server });

    server.listen(this.port);
  }

  _createClass(Server, [{
    key: '_setupWatcher',
    value: function _setupWatcher(root, paths, ignored) {
      var _this2 = this;

      var watcher = (0, _sane2.default)(root, {
        glob: paths,
        ignored: ignored,
        dot: true,
        watchman: true
      });

      watcher.on('ready', function () {
        process.send({ message: 'Reading files to be linted...[this may take a little bit]' });
        var filePaths = [];
        for (var i = 0; i < paths.length; i++) {
          var files = _glob2.default.sync(paths[i], {
            cwd: root,
            absolute: true
          });
          files.forEach(function (file) {
            filePaths.push(file);
          });
        }

        _this2.lintAllFiles(filePaths);
      });

      watcher.on('change', function (filepath) {
        var filePaths = [];
        if (filepath.indexOf('.eslintrc') !== -1) {
          _this2.cache = {};
          for (var i = 0; i < paths.length; i++) {
            var files = _glob2.default.sync(paths[i], {
              cwd: root,
              absolute: true
            });
            files.forEach(function (file) {
              filePaths.push(file);
            });
          }
          _this2.lintAllFiles(filePaths);
        } else {
          _this2.lintFile(filepath);
        }
      });
      watcher.on('add', function (filepath) {
        _this2.lintFile(filepath);
      });
      watcher.on('delete', function (filepath) {
        delete _this2.cache[filepath];
      });
    }
  }, {
    key: 'getResultsFromCache',
    value: function getResultsFromCache() {
      var _this3 = this;

      var records = Object.keys(this.cache).filter(function (filepath) {
        return _this3.cache[filepath] && (_this3.cache[filepath].errorCount > 0 || _this3.cache[filepath].warningCount > 0);
      }).map(function (filepath) {
        return _this3.cache[filepath];
      });

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
    }
  }, {
    key: 'lintFile',
    value: function lintFile(file) {
      if (eslint.isPathIgnored(file) || file.indexOf('eslint') !== -1) {
        return;
      }
      this.filesToProcess++;
      var that = this;
      this.lintRunner.run([file]).then(function (results) {
        var record = results.records[0];
        if (record) {
          delete record.source;
          that.cache[record.filePath] = record;
        }
        that.filesToProcess--;
      }).catch(function (e) {
        return console.error(e);
      });
    }
  }, {
    key: 'lintAllFiles',
    value: function lintAllFiles(files) {
      var _this4 = this;

      files.map(function (file) {
        _this4.lintFile(file);
      });
    }
  }]);

  return Server;
}();

exports.default = Server;