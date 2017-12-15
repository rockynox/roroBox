#!/usr/bin/env node
import five from 'johnny-five';
import moment from 'moment';
import {heart, printSelectedMessage, smile} from './utils';

var board = new five.Board({repl: false});
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
    lightWasOn: false,
    isTopOpen: false,
};

var clearTypedCodeTimeOut = null;

var shouldDisplayMessage = false;
var messageHasBeenDisplayed = false;

board.on('ready', function () {

    /////////////// Init /////////////////

//ledBouton
    var ledBouton = new five.Led(3);

//Traps
    //Todo: remove commented declaration
//     var trapOne = new five.Pin(2);
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
        console.log(state.now.format('D/M/YY [à] H:m:s') + ' Printing. ( "' + message + '" )');
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
        console.log(state.now.format('D/M/YY [à] H:m:s') + ' : Letter : ' + letter + ' pressed');
        clearTimeout(clearTypedCodeTimeOut);
        state.typedCode = state.typedCode + letter;
        console.log(state.now.format('D/M/YY [à] H:m:s') + ' : Typed code : ' + state.typedCode);
        clearTypedCodeTimeOut = setTimeout(() => state.typedCode = '', 3000);
        checkTypedCode();
    };

    var checkTypedCode = () => {
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

    var giveCard = (cardNumber) => {
        console.log(state.now.format('D/M/YY [à] H:m:s') + ' : Giving Card... N° ' + cardNumber);
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

    var printHeartOnMatrix = () => {
        matrix.draw(heart);
        setTimeout(() => matrix.clear(), 5000);
    };

    var printSmileOnMatrix = () => {
        matrix.draw(smile);
        setTimeout(() => matrix.clear(), 5000);
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
        //Todo: remove commented declaration
        // trapOne.high();
        // setTimeout(() => trapOne.low(), 10000);
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

//////////////// Debug Tests ////////////////

//ledBouton
    var greenLed = new five.Led(2);

    var blinkGreenLed = () => {
        greenLed.on();

        this.wait(2000, function () {
            greenLed.off();
        });
    };

    //RedButton
    var redButton = new five.Button(5);
    redButton.on('press', function () {
        console.log(state.now.format('D/M/YY [à] H:m:s') + ' : Mail pressed.');
        if (moment().format('DD-MM-YYYY') === moment('10-11-2017', 'DD-MM-YYYY').format('DD-MM-YYYY')) {
            doSunAction();
        }
        if (shouldDisplayMessage) {
            ledBouton.fadeOut(1000);
            printSelectedMessage(LCD.printMessage);
            blinkGreenLed();
            //printHeartOnMatrix();
            messageHasBeenDisplayed = true;
        }
    });

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
    //             ledBouton.on();
    //             shouldDisplayMessage = true;
    //         } else if (state.now.isBefore(state.messageTime) && messageHasBeenDisplayed === true) {
    //             console.log(state.now.format('D/M/YY [à] H:m:s') + ' : Message should NOT be displayed.');
    //             messageHasBeenDisplayed = false;
    //             shouldDisplayMessage = false;
    //         }
    //     }, ROUTINE_INTERVAL,
    // );

    this.loop(ROUTINE_INTERVAL, () => {

        state.messageTime = moment();
        state.messageTime.set({'hour': 8, 'minute': 26});

        state.now = moment();

        if (state.now.isAfter(state.messageTime, 'minute') && messageHasBeenDisplayed === false) {
            console.log(state.now.format('D/M/YY [à] H:m:s') + ' : Message should be displayed.');
            ledBouton.on();
            shouldDisplayMessage = true;
        } else if (state.now.isBefore(state.messageTime) && messageHasBeenDisplayed === true) {
            console.log(state.now.format('D/M/YY [à] H:m:s') + ' : Message should NOT be displayed.');
            messageHasBeenDisplayed = false;
            shouldDisplayMessage = false;
        }
    });

    // LCD.printMessage('Hey jolie jeune fille !');
    // printSmileOnMatrix();

    LCD.printMessage('Je t\'aime');
    printHeartOnMatrix();
});


