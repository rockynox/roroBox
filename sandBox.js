#!/usr/bin/env node
import moment from 'moment';
import {getMessageTime, initDayState, printSelectedMessage} from './utils';

const readline = require('readline');

// var board = new five.Board({repl: false});
var ROUTINE_INTERVAL = 10000;
var monthCode = {
    8: 'aaa',
    9: 'atg',
    10: 'tgg',
    11: 'cat',
    12: 'cta',
    1: 'gta',
};

var state = {
    messageTime: getMessageTime(),
    shouldDiplayMessage: false,
    typedCode: '',
    now: moment(),
    lightWasOn: false,
    isTopOpen: false,
};

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on('keypress', (str, key) => {
    console.log('mailPressed');
    if (state.now.format('DD-MM-YYYY') === moment('10-11-2017', 'DD-MM-YYYY').format('DD-MM-YYYY')) {
        console.log('sunAction');
    }
    if (state.shouldDiplayMessage) {
        printSelectedMessage(console.log);
        state.shouldDiplayMessage = false;
    }
    if (key.name === 'q') {
        process.exit();
    }
});

////////////////// Routine ////////////////

setInterval(
    function () {
        let now = moment();
        if (!now.isSame(state.messageTime, 'day')) {
            state = initDayState();
        }
        if (state.messageTime.hours() === now.hours() && state.messageTime.minutes() === now.minutes()) {
            console.log('**** messageTime ****');
            state.shouldDiplayMessage = true;
        }
    }, ROUTINE_INTERVAL);

