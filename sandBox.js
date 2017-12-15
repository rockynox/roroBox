#!/usr/bin/env node
import five from 'johnny-five';
import moment from 'moment';
import {printSelectedMessage} from './utils';

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

//
    var printMessage = (message) => {
        console.log(state.now.format('D/M/YY [à] H:m:s') + ' Printing. ( "' + message + '" )');
        let numberOfScreen = Math.floor(message.length / 32) + 1;
        let duration = numberOfScreen * 3000;
        for (let i = 0; i < numberOfScreen; i++) {
            this.wait(3000 * i, function () {
                let firstLetter = 32 * i;
            });
        }
        setTimeout(() => {
        }, duration);
    };

////////////////// Functions ////////////////

//ledBouton
    var greenLed = new five.Led(2);

    var blinkGreenLed = () => {
        greenLed.on();

        this.wait(2000, function () {
            led.stop().off();
        });
    }

    //RedButton
    var redButton = new five.Button(5);
    redButton.on('press', function () {
        console.log(state.now.format('D/M/YY [à] H:m:s') + ' : Mail pressed.');
        if (moment().format('DD-MM-YYYY') === moment('10-11-2017', 'DD-MM-YYYY').format('DD-MM-YYYY')) {
            console.log('Doing Sun Action...');
        }
        if (shouldDisplayMessage) {
            ledBouton.fadeOut(1000);
            printSelectedMessage(printMessage);
            blinkGreenLed();
            //printHeartOnMatrix();
            messageHasBeenDisplayed = true;
        }
    });

////////////////// Routine ////////////////

    setInterval(
        function () {
            state.messageTime = moment();
            state.messageTime.set({'hour': 21, 'minute': 55});

            state.now = moment();

            if (state.now.isAfter(state.messageTime, 'minute') && messageHasBeenDisplayed === false) {
                ledBouton.on();
                shouldDisplayMessage = true;
                messageHasBeenDisplayed = false;
            } else if (state.now.isBefore(state.messageTime) && messageHasBeenDisplayed === true) {
                shouldDisplayMessage = false;

            }
        }, ROUTINE_INTERVAL,
    );

    // this.loop(ROUTINE_INTERVAL, () => {
    //     state.messageTime = moment();
    //     state.messageTime.set({'hour': 12, 'minute': 30});
    //
    //     state.now = moment();
    //
    //     //printSelectedMessage(LCD.printMessage);
    //
    //     if (state.now.isAfter(state.messageTime, 'minute') && messageHasBeenDisplayed === false) {
    //         ledBouton.on();
    //         shouldDisplayMessage = true;
    //         messageHasBeenDisplayed = false;
    //     } else if (state.now.isBefore(state.messageTime) && messageHasBeenDisplayed === true) {
    //         shouldDisplayMessage = false;
    //     }
    // });

    LCD.printMessage('Hey jolie jeune fille !');
});