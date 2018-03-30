#!/usr/bin/env node
'use strict';

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _commands = require('./commands/');

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NUM_CPUS = _os2.default.cpus().length;
var DEFAULT_PORT_NUMBER = 5004;

var getEsprintOptions = function getEsprintOptions(argv) {
  var options = {
    workers: NUM_CPUS,
    port: DEFAULT_PORT_NUMBER
  };

  var filePath = (0, _util.findFile)('.esprintrc');

  if (!filePath) {
    console.error('Unable to find `.esprintrc` file. Exiting...');
    process.exit(1);
  } else {
    // read config file
    var rc = JSON.parse(_fs2.default.readFileSync(filePath));

    Object.assign(options, rc);
    options.rcPath = filePath;
    options.workers = NUM_CPUS;

    // CLI overrides
    if (argv.workers) {
      if (argv.workers > NUM_CPUS) {
        console.warn(`Number of CPUs specified (${argv.workers}) exceeded system max (${NUM_CPUS}). Using ${NUM_CPUS}`);
        argv.workers = NUM_CPUS;
      }
      options.workers = argv.workers;
    }

    // ESLint-specific options
    if (argv.format || argv.f) {
      Object.assign(options, { formatter: argv.f ? argv.f : argv.format });
    }

    // NB: Passing --quiet as a number for compatibility with yargs
    options.quiet = options.quiet ? 1 : 0;

    return options;
  }
};

var usage = `Spins up a server on a specified port to run eslint in parallel.
  Usage: esprint [args]`;

_yargs2.default.usage(usage).command('stop', 'Stops running the background server', function () {}, function () {
  (0, _commands.stop)();
}).command('check', 'Runs eslint in parallel with no background server', function () {}, function (argv) {
  var options = getEsprintOptions(argv);
  (0, _commands.check)(options);
}).command(['*', 'start'], 'Starts up a background server which listens for file changes.', function () {}, function (argv) {
  var options = getEsprintOptions(argv);
  if (!options.port) {
    process.exit(1);
  } else {
    (0, _commands.connect)(options);
  }
}).help().argv;