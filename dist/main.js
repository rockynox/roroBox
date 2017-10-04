#!/usr/bin/env node
'use strict';

var _johnnyFive = require('johnny-five');

var _johnnyFive2 = _interopRequireDefault(_johnnyFive);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var board = new _johnnyFive2.default.Board({ repl: false });
var ROUTINE_INTERVAL = 10000;
var monthCode = {
    8: 'aaa',
    9: 'atg',
    10: 'tgg',
    11: 'cat',
    12: 'cta',
    1: 'gta'
};

var state = (0, _utils.initDayState)();
var clearTypedCodeTimeOut = null;

board.on('ready', function () {
    var _this = this;

    /////////////// Init /////////////////

    //ledBouton
    var ledBouton = new _johnnyFive2.default.Led(3);

    //Traps
    var trapOne = new _johnnyFive2.default.Pin(2);
    var trapTwo = new _johnnyFive2.default.Pin(12);
    var trapTop = new _johnnyFive2.default.Pin(13);

    //LCD
    var LCD = new _johnnyFive2.default.LCD({
        controller: 'PCF8574T'
    });

    LCD.useChar('heart');
    LCD.useChar('pointerdown');
    LCD.useChar('smile');
    LCD.useChar('sdot');
    LCD.useChar('note');

    //
    LCD.printMessage = function (message) {
        console.log('PRINTING : ' + message);
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

    //EmergencySwitch
    var emergencySwitch = new _johnnyFive2.default.Button(6);

    emergencySwitch.on('down', function () {
        openTrapeTwo();
    });

    //RedButton
    var redButton = new _johnnyFive2.default.Button(5);
    redButton.on('press', function () {
        console.log('mailPressed');
        if (state.now.format('DD-MM-YYYY') === (0, _moment2.default)('10-11-2017', 'DD-MM-YYYY').format('DD-MM-YYYY')) {
            doSunAction();
        }
        if (state.shouldDiplayMessage) {
            (0, _utils.printSelectedMessage)(LCD.printMessage);
            ledBouton.fadeOut(1000);
        }
    });

    //KeyPad
    var keyPad_A = new _johnnyFive2.default.Button(4);
    var keyPad_C = new _johnnyFive2.default.Button(9);
    var keyPad_G = new _johnnyFive2.default.Button(7);
    var keyPad_T = new _johnnyFive2.default.Button(8);
    //
    keyPad_A.on('press', function () {
        if (state.isTopOpen) {
            closeTrapeTop();
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

    //Matrix
    var matrix = new _johnnyFive2.default.Led.Matrix({
        addresses: [0x70],
        controller: 'HT16K33',
        dims: '8x16',
        rotation: 2
    });

    //Servo
    var topServo = new _johnnyFive2.default.Servo({
        pin: 10,
        startAt: 0
    });

    ////////////////// Functions ////////////////

    var addTypedLetter = function addTypedLetter(letter) {
        console.log('letter : ' + letter + ' pressed');
        clearTimeout(clearTypedCodeTimeOut);
        state.typedCode = state.typedCode + letter;
        console.log('typed code : ' + state.typedCode);
        clearTypedCodeTimeOut = setTimeout(function () {
            return state.typedCode = '';
        }, 3000);
        checkTypedCode();
    };

    var checkTypedCode = function checkTypedCode() {
        if (monthCode[state.now.format('M')] === state.typedCode) {
            console.log('Correct Code pour le mois de :');
            switch (Number(state.now.format('M'))) {
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

    var giveCard = function giveCard(cardNumber) {
        console.log('Giving Card... N° ' + cardNumber);
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
        matrix.draw(_utils.heart);
        setTimeout(function () {
            return matrix.clear();
        }, 10000);
        openTrapeTop();
    };

    var printCharOnMatrix = function printCharOnMatrix(char) {
        var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10000;

        matrix.draw(_johnnyFive2.default.Led.Matrix.CHARS[char]);
        setTimeout(function () {
            return matrix.clear();
        }, timeout);
    };

    var closeTrapeTop = function closeTrapeTop() {
        console.log('closeTop');
        trapTop.high();
        topServo.to(10);
        setTimeout(function () {
            return trapTop.low();
        }, 1000);
        state.isTopOpen = false;
    };

    var openTrapeTop = function openTrapeTop() {
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

    var openTrapeOne = function openTrapeOne() {
        console.log('openOne');
        printCharOnMatrix('arrownw');
        trapOne.high();
        setTimeout(function () {
            return trapOne.low();
        }, 10000);
        setTimeout(function () {
            return matrix.draw(_utils.heart);
        }, 10000);
        setTimeout(function () {
            return matrix.clear();
        }, 20000);
    };

    var openTrapeTwo = function openTrapeTwo() {
        console.log('openTwo');
        printCharOnMatrix('arrowne');
        trapTwo.high();
        setTimeout(function () {
            return trapTwo.low();
        }, 10000);
        setTimeout(function () {
            return matrix.draw(_utils.heart);
        }, 10000);
        setTimeout(function () {
            return matrix.clear();
        }, 20000);
    };

    ////////////////// Routine ////////////////

    setInterval(function () {
        var now = (0, _moment2.default)();
        if (!now.isSame(state.messageTime, 'day')) {
            state = (0, _utils.initDayState)();
        }
        if (state.messageTime.hours() === now.hours() && state.messageTime.minutes() === now.minutes()) {
            state.shouldDiplayMessage = true;
            ledBouton.on();
        }
    }, ROUTINE_INTERVAL);

    LCD.printMessage('Hey jolie jeune fille !');
});
//# sourceMappingURL=main.js.map