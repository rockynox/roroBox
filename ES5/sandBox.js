#!/usr/bin/env node
'use strict';

var johnnyFive = require('johnny-five');

var moment = require('moment');

var utils = require('./utils');

var board = new johnnyFive.Board({repl: false});
var ROUTINE_INTERVAL = 2000;
var monthCode = {
    8: 'aaa',
    9: 'atg',
    10: 'tgg',
    11: 'cat',
    12: 'cta',
    1: 'gta',
};

var state = {
    messageTime: null,
    typedCode: '',
    now: moment(),
    lightWasOn: false,
    isTopOpen: false,
};

var clearTypedCodeTimeOut = null;

var shouldDisplayMessage = false;
var messageHasBeenDisplayed = false;

board.on('ready', function () {

    var _this = this;

    /////////////// Init /////////////////

    //ledBouton
    var ledBouton = new johnnyFive.Led(3);

    //
    var printMessage = function printMessage(message) {
        console.log(moment().format('D/M/YY [à] H:mm:ss') + ' Printing. ( "' + message + '" )');
        var numberOfScreen = Math.floor(message.length / 32) + 1;
        var duration = numberOfScreen * 3000;

        var _loop = function _loop(i) {
            _this.wait(3000 * i, function () {
                var firstLetter = 32 * i;
            });
        };

        for (var i = 0; i < numberOfScreen; i++) {
            _loop(i);
        }
        setTimeout(function () {
        }, duration);
    };

    ////////////////// Functions ////////////////

    //ledBouton
    var greenLed = new johnnyFive.Led(2);

    //RedButton
    var redButton = new johnnyFive.Button(5);
    redButton.on('press', function () {
        console.log(moment().format('D/M/YY [à] H:mm:ss') + ' : Mail pressed.');
        // if (_moment().format('DD-MM-YYYY') === _moment('10-11-2017', 'DD-MM-YYYY').format('DD-MM-YYYY')) {
        //     console.log('Doing Sun Action...');
        // }
        if (shouldDisplayMessage) {
            ledBouton.fadeOut(1000);
            utils.printSelectedMessage(printMessage);

            greenLed.toggle();

            messageHasBeenDisplayed = true;
        }
    });

    ////////////////// Routine ////////////////

    state.messageTime = moment();
    state.messageTime.set({'hour': 12, 'minute': 30});

    // setInterval(function () {
    //     state.messageTime = moment();
    //     state.messageTime.set({ 'hour': 21, 'minute': 55 });
    //
    //     state.now = moment();
    //
    //     if (state.now.isAfter(state.messageTime, 'minute') && messageHasBeenDisplayed === false) {
    //         ledBouton.on();
    //         shouldDisplayMessage = true;
    //         messageHasBeenDisplayed = false;
    //     } else if (state.now.isBefore(state.messageTime) && messageHasBeenDisplayed === true) {
    //         shouldDisplayMessage = false;
    //     }
    // }, ROUTINE_INTERVAL);

    _this.loop(ROUTINE_INTERVAL, () => {

        state.now = moment();

        if (state.now.isAfter(state.messageTime, 'minute') && messageHasBeenDisplayed === false) {
            ledBouton.on();
            shouldDisplayMessage = true;
            messageHasBeenDisplayed = false;
        } else if (state.now.isBefore(state.messageTime) && messageHasBeenDisplayed === true) {
            shouldDisplayMessage = false;
        }
    });
});
//# sourceMappingURL=sandBox.js.map