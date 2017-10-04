#!/usr/bin/env node
'use strict';

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var readline = require('readline');

// var board = new five.Board({repl: false});
var ROUTINE_INTERVAL = 10000;
var monthCode = {
    8: 'aaa',
    9: 'atg',
    10: 'tgg',
    11: 'cat',
    12: 'cta',
    1: 'gta'
};

var state = {
    messageTime: (0, _utils.getMessageTime)(),
    shouldDiplayMessage: false,
    typedCode: '',
    now: (0, _moment2.default)(),
    lightWasOn: false,
    isTopOpen: false
};

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on('keypress', function (str, key) {
    console.log('mailPressed');
    if (state.now.format('DD-MM-YYYY') === (0, _moment2.default)('10-11-2017', 'DD-MM-YYYY').format('DD-MM-YYYY')) {
        console.log('sunAction');
    }
    if (state.shouldDiplayMessage) {
        (0, _utils.printSelectedMessage)(console.log);
        state.shouldDiplayMessage = false;
    }
    if (key.name === 'q') {
        process.exit();
    }
});

////////////////// Routine ////////////////

setInterval(function () {
    var now = (0, _moment2.default)();
    if (!now.isSame(state.messageTime, 'day')) {
        state = (0, _utils.initDayState)();
    }
    if (state.messageTime.hours() === now.hours() && state.messageTime.minutes() === now.minutes()) {
        console.log('**** messageTime ****');
        state.shouldDiplayMessage = true;
    }
}, ROUTINE_INTERVAL);
//# sourceMappingURL=sandBox.js.map