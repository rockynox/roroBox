#!/usr/bin/env node
import five from 'johnny-five';
import moment from 'moment';
import {heart, initDayState, printSelectedMessage} from './utils';

var board = new five.Board({repl: false});
var ROUTINE_INTERVAL = 10000;
var monthCode = {
    8: 'aaa',
    9: 'atg',
    10: 'tgg',
    11: 'cat',
    12: 'cta',
    1: 'gta',
};

var state = initDayState();
var clearTypedCodeTimeOut = null;

board.on('ready', function () {

    /////////////// Init /////////////////

//ledBouton
    var ledBouton = new five.Led(3);

//Traps
    var trapOne = new five.Pin(2);
    var trapTwo = new five.Pin(12);
    var trapTop = new five.Pin(13);

//LCD
    var LCD = new five.LCD({
        controller: 'PCF8574T',
    });

    LCD.useChar('heart');
    LCD.useChar('pointerdown');
    LCD.useChar('smile');
    LCD.useChar('sdot');
    LCD.useChar('note');

//
    LCD.printMessage = (message) => {
        console.log('PRINTING : ' + message);
        LCD.on();
        let numberOfScreen = Math.floor(message.length / 32) + 1;
        let duration = numberOfScreen * 3000;
        for (let i = 0; i < numberOfScreen; i++) {
            this.wait(3000 * i, function () {
                let firstLetter = 32 * i;
                LCD.clear();
                LCD.cursor(0, 0);
                LCD.print(message.substr(firstLetter, 16));
                LCD.cursor(1, 0);
                LCD.print(message.substr(firstLetter + 16, 16));
            });
        }
        setTimeout(() => {
            LCD.off();
        }, duration);
    };

//EmergencySwitch
    var emergencySwitch = new five.Button(6);

    emergencySwitch.on('down', function () {
        openTrapeTwo();
    });

//RedButton
    var redButton = new five.Button(5);
    redButton.on('press', function () {
        console.log('mailPressed');
        if (state.now.format('DD-MM-YYYY') === moment('10-11-2017', 'DD-MM-YYYY').format('DD-MM-YYYY')) {
            doSunAction();
        }
        if (state.shouldDiplayMessage) {
            printSelectedMessage(LCD.printMessage);
            ledBouton.fadeOut(1000);
        }
    });

//KeyPad
    var keyPad_A = new five.Button(4);
    var keyPad_C = new five.Button(9);
    var keyPad_G = new five.Button(7);
    var keyPad_T = new five.Button(8);
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
    var matrix = new five.Led.Matrix({
        addresses: [0x70],
        controller: 'HT16K33',
        dims: '8x16',
        rotation: 2,
    });

//Servo
    var topServo = new five.Servo({
        pin: 10,
        startAt: 0,
    });

////////////////// Functions ////////////////

    var addTypedLetter = (letter) => {
        console.log('letter : ' + letter + ' pressed');
        clearTimeout(clearTypedCodeTimeOut);
        state.typedCode = state.typedCode + letter;
        console.log('typed code : ' + state.typedCode);
        clearTypedCodeTimeOut = setTimeout(() => state.typedCode = '', 3000);
        checkTypedCode();
    };

    var checkTypedCode = () => {
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

    var giveCard = (cardNumber) => {
        console.log('Giving Card... N° ' + cardNumber);
        LCD.on();
        LCD.clear();
        LCD.cursor(0, 0);
        LCD.print('Prends une carte');
        LCD.cursor(1, 0);
        LCD.print(':smile::smile::pointerdown::pointerdown::pointerdown::pointerdown::pointerdown::pointerdown::pointerdown::pointerdown::pointerdown::pointerdown::pointerdown::pointerdown::smile::smile:');
        setTimeout(() => {
            LCD.off();
        }, 10000);
        printCharOnMatrix(cardNumber);
    };

    var doSunAction = () => {
        console.log('Doing Sun Action...');
        matrix.draw(heart);
        setTimeout(() => matrix.clear(), 10000);
        openTrapeTop();
    };

    var printCharOnMatrix = (char, timeout = 10000) => {
        matrix.draw(five.Led.Matrix.CHARS[char]);
        setTimeout(() => matrix.clear(), timeout);
    };

    var closeTrapeTop = () => {
        console.log('closeTop');
        trapTop.high();
        topServo.to(10);
        setTimeout(() => trapTop.low(), 1000);
        state.isTopOpen = false;
    };

    var openTrapeTop = () => {
        console.log('openTop');
        trapTop.high();
        setTimeout(() => trapTop.low(), 2000);
        setTimeout(() => topServo.to(80), 1000);
        state.isTopOpen = true;
    };

    var openTrapeOne = () => {
        console.log('openOne');
        printCharOnMatrix('arrownw');
        trapOne.high();
        setTimeout(() => trapOne.low(), 10000);
        setTimeout(() => matrix.draw(heart), 10000);
        setTimeout(() => matrix.clear(), 20000);
    };

    var openTrapeTwo = () => {
        console.log('openTwo');
        printCharOnMatrix('arrowne');
        trapTwo.high();
        setTimeout(() => trapTwo.low(), 10000);
        setTimeout(() => matrix.draw(heart), 10000);
        setTimeout(() => matrix.clear(), 20000);
    };

////////////////// Routine ////////////////

    setInterval(
        function () {
            let now = moment();
            if (!now.isSame(state.messageTime, 'day')) {
                state = initDayState();
            }
            if (state.messageTime.hours() === now.hours() && state.messageTime.minutes() === now.minutes()) {
                state.shouldDiplayMessage = true;
                ledBouton.on();
            }
        }, ROUTINE_INTERVAL);

    LCD.printMessage('Hey jolie jeune fille !');
});