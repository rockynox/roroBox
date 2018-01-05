#!/usr/bin/env node
'use strict';

var johnnyFive = require('johnny-five');
var moment = require('moment');
var utils = require('./utils');

var board = new johnnyFive.Board({repl: false});

var ROUTINE_INTERVAL = 5000;

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
    shouldDisplayMessage: false,
    messageHasBeenDisplayed: false,
    isTopOpen: false,
};

var clearTypedCodeTimeOut = 1000;

var shouldDisplayMessage = false;
var messageHasBeenDisplayed = false;

board.on('ready', function () {
    var _this = this;

    ////////////////// LCD ////////////////

    var LCD = new johnnyFive.LCD({
        controller: 'PCF8574T',
    });

    //
    LCD.printMessage = function (message) {
        console.log(state.now.format('D/M/YY [à] H:m:s') + ' Printing. ( "' + message + '" )');
        LCD.on();
        var numberOfScreen = Math.floor(message.length / 32) + 1;
        var duration = numberOfScreen * 3000;

        var _loop = function _loop(i) {
            _this.wait(3000 * i, function () {
                var firstLetter = 32 * i;
                LCD.clear();
                LCD.cursor(0, 0);
                LCD.print(message.substr(firstLetter, 16));
                LCD.cursor(1, 0);
                LCD.print(message.substr(firstLetter + 16, 16));
            });
        };

        for (var i = 0; i < numberOfScreen; i++) {
            _loop(i);
        }
        setTimeout(function () {
            LCD.off();
        }, duration);
    };

    ////////////////// Emergency Switch ////////////////

    var emergencySwitch = new johnnyFive.Button(6);

    emergencySwitch.on('down', function () {
        openTrapeTwo();
    });

    //Servo

    ////////////////// Matrix ////////////////

    var matrix = new johnnyFive.Led.Matrix({
        addresses: [0x70],
        controller: 'HT16K33',
        dims: '8x16',
        rotation: 2,
    });

    var printCharOnMatrix = function printCharOnMatrix(char) {
        var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10000;

        matrix.draw(johnnyFive.Led.Matrix.CHARS[char]);
        setTimeout(function () {
            return matrix.clear();
        }, timeout);
    };

    var printHeartOnMatrix = function printHeartOnMatrix() {
        matrix.draw(utils.heart);
        setTimeout(function () {
            return matrix.clear();
        }, 5000);
    };

    var printSmileOnMatrix = function printSmileOnMatrix() {
        matrix.draw(utils.smile);
        setTimeout(function () {
            return matrix.clear();
        }, 5000);
    };

    ////////////////// Trap Top ////////////////

    var trapTop = new johnnyFive.Pin(13);
    var topServo = new johnnyFive.Servo({
        pin: 10,
        startAt: 0,
    });

    var openTrapTop = function openTrapTop() {
        console.log('openTop');
        trapTop.high();
        setTimeout(function () {
            return trapTop.low();
        }, 2000);
        setTimeout(function () {
            return topServo.to(80);
        }, 1000);
        state.isTopOpen = true;
    };

    var closeTrapTop = function closeTrapTop() {
        console.log('closeTop');
        trapTop.high();
        topServo.to(10);
        setTimeout(function () {
            return trapTop.low();
        }, 1000);
        state.isTopOpen = false;
    };

    ////////////////// Trap One ////////////////

    var trapOne = new johnnyFive.Pin(2);

    var openTrapeOne = function openTrapeOne() {
        console.log('openOne');
        printCharOnMatrix('arrownw');
        trapOne.high();
        setTimeout(() => trapOne.low(), 10000);
        setTimeout(function () {
            return matrix.draw(utils.heart);
        }, 10000);
        setTimeout(function () {
            return matrix.clear();
        }, 20000);
    };

    ////////////////// Trap Two ////////////////

    var trapTwo = new johnnyFive.Pin(12);

    var openTrapeTwo = function openTrapeTwo() {
        console.log('openTwo');
        printCharOnMatrix('arrowne');
        trapTwo.high();
        setTimeout(function () {
            return trapTwo.low();
        }, 10000);
        setTimeout(function () {
            return matrix.draw(utils.heart);
        }, 10000);
        setTimeout(function () {
            return matrix.clear();
        }, 20000);
    };

    ////////////////// KeyPad ////////////////

    var keyPad_A = new johnnyFive.Button(4);
    var keyPad_C = new johnnyFive.Button(9);
    var keyPad_G = new johnnyFive.Button(7);
    var keyPad_T = new johnnyFive.Button(8);

    keyPad_A.on('press', function () {
        if (state.isTopOpen) {
            closeTrapTop();
        } else {
            addTypedLetter('a');
        }
    });
    keyPad_C.on('press', function () {
        addTypedLetter('c');
    });
    keyPad_G.on('press', function () {
        addTypedLetter('g');
    });
    keyPad_T.on('press', function () {
        addTypedLetter('t');
    });

    var addTypedLetter = function addTypedLetter(letter) {
        console.log(state.now.format('D/M/YY [à] H:m:s') + ' : Letter : ' + letter + ' pressed');
        clearTimeout(clearTypedCodeTimeOut);
        state.typedCode = state.typedCode + letter;
        console.log(state.now.format('D/M/YY [à] H:m:s') + ' : Typed code : ' + state.typedCode);
        clearTypedCodeTimeOut = setTimeout(function () {
            return state.typedCode = '';
        }, 3000);
        checkTypedCode();
    };

    var checkTypedCode = function checkTypedCode() {
        if (monthCode[moment().format('M')] === state.typedCode) {
            console.log('Correct Code pour le mois de :');
            switch (Number(moment().format('M'))) {
                case 9:
                    console.log('septembre');
                    openTrapeOne();
                    break;
                case 11:
                    console.log('octobre');
                    giveCard(1);
                    break;
                case 12:
                    console.log('novembre');
                    giveCard(2);
                    break;
                case 1:
                    console.log('decembre');
                    giveCard(3);
                    break;
                default:
                    console.log('janvier');
                    giveCard(4);
                    break;
            }
        }
    };

    ////////////////// mailButton ////////////////

    var mailLed = new johnnyFive.Led(3);
    var mailButton = new johnnyFive.Button(5);

    mailButton.on('press', function () {
        console.log(state.now.format('D/M/YY [à] H:m:s') + ' : Mail pressed.');
        mailLed.fadeOut(1000);
        utils.printSelectedMessage(LCD.printMessage);
    });

    ////////////////// Function ////////////////

    var giveCard = function giveCard(cardNumber) {
        console.log(state.now.format('D/M/YY [à] H:m:s') + ' : Giving Card... N° ' + cardNumber);
        LCD.on();
        LCD.clear();
        LCD.cursor(0, 0);
        LCD.print('Prends une carte');
        LCD.cursor(1, 0);
        LCD.print(':smile::smile::pointerdown::pointerdown::pointerdown::pointerdown::pointerdown::pointerdown::pointerdown::pointerdown::pointerdown::pointerdown::pointerdown::pointerdown::smile::smile:');
        setTimeout(function () {
            LCD.off();
        }, 10000);
        printCharOnMatrix(cardNumber);
    };

    var doSunAction = function doSunAction() {
        console.log('Doing Sun Action...');
        matrix.draw(utils.heart);
        setTimeout(function () {
            return matrix.clear();
        }, 10000);
        openTrapTop();
    };

    //////////////// Debug Tests ////////////////

    // var greenLed = new johnnyFive.Led(2);
    //
    // var blinkGreenLed = function blinkGreenLed() {
    //     greenLed.on();
    //
    //     _this.wait(2000, function () {
    //         greenLed.off();
    //     });
    // };

    ////////////////// Routine ////////////////

    // setInterval(
    //     function () {
    //         state.messageTime = moment();
    //         state.messageTime.set({'hour': 8, 'minute': 26});
    //
    //         state.now = moment();
    //
    //         if (state.now.isAfter(state.messageTime, 'minute') && messageHasBeenDisplayed === false) {
    //             console.log(state.now.format('D/M/YY [à] H:m:s') + ' : Message should be displayed.');
    //             mailLed.on();
    //             shouldDisplayMessage = true;
    //         } else if (state.now.isBefore(state.messageTime) && messageHasBeenDisplayed === true) {
    //             console.log(state.now.format('D/M/YY [à] H:m:s') + ' : Message should NOT be displayed.');
    //             messageHasBeenDisplayed = false;
    //             shouldDisplayMessage = false;
    //         }
    //     }, ROUTINE_INTERVAL,
    // );

    // this.loop(ROUTINE_INTERVAL, function () {
    //
    //     state.messageTime = moment();
    //     state.messageTime.set({'hour': 8, 'minute': 26});
    //
    //     state.now = moment();
    //
    //     if (state.now.isAfter(state.messageTime, 'minute') && messageHasBeenDisplayed === false) {
    //         console.log(state.now.format('D/M/YY [à] H:m:s') + ' : Message should be displayed.');
    //         mailLed.on();
    //         shouldDisplayMessage = true;
    //     } else if (state.now.isBefore(state.messageTime) && messageHasBeenDisplayed === true) {
    //         console.log(state.now.format('D/M/YY [à] H:m:s') + ' : Init state.');
    //         messageHasBeenDisplayed = false;
    //         shouldDisplayMessage = false;
    //     }
    // });

    LCD.printMessage('Hey jolie jeune fille !');
    printHeartOnMatrix();
});
//# sourceMappingURL=main.js.map