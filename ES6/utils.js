import jsonfile from 'jsonfile';
import moment from 'moment';

var filePath = '/home/pi/roroSecours/messages.json';

// var filePath = './messages.json';

export function printSelectedMessage(printCallback) {
    var selectedMessage = null;
    jsonfile.readFile(filePath, function (error, messages) {
        if (messages) {
            var today = moment().format('DD/MM/YY');
            messages.forEach(function (message) {
                if (message.shouldBeDiplayOn === today || message.haveBeenDiplayedOn === today) {
                    selectedMessage = message;
                } else if (!selectedMessage && message.haveBeenDiplayedOn === '' && message.shouldBeDiplayOn === '') {
                    selectedMessage = message;
                }
            });
            console.error(moment().format('D/M/YY [à] H:m:s') + ': Selected message id : ' + selectedMessage.id);
            messages[selectedMessage.id].haveBeenDiplayedOn = today;
            jsonfile.writeFile(filePath, messages, function (err) {
                if (err) {
                    console.error(moment().format('D/M/YY [à] H:m:s') + ' ' + err);
                }
            });
            printCallback(selectedMessage.content);
        }
        if (error) {
            console.log(moment().format('D/M/YY [à] H:m:s') + ' ' + error);
        }
    });
}

export function getMessageTime() {
    var messageTime = moment();
    messageTime.set('hour', 10);
    messageTime.set('minute', 0);
    console.log('==========  New message time : ' + messageTime.format('D/M/YY à H:mm:ss'));
    return messageTime;
}
// export function getMessageTime() {
//     var messageTime = moment();
//     messageTime.set('hour', Math.floor(Math.random() * (20 - 6)) + 6);
//     messageTime.set('minute', Math.floor(Math.random() * (60)));
//     console.log("==========  New message time : " + messageTime.format("D/M/YY à H:mm:ss"));
//     return messageTime;
// }

export function initDayState() {
    return {
        messageTime: getMessageTime(),
        shouldDiplayMessage: false,
        typedCode: '',
        now: moment(),
        lightWasOn: false,
        isTopOpen: false,
    };
}


export var heart = [
    '0110011001100110',
    '1001100110011001',
    '1000000110000001',
    '1000000110000001',
    '0100001001000010',
    '0010010000100100',
    '0001100000011000',
    '0000000000000000',
];

export var smile = [
    '0000000000000000',
    '0010010000100000',
    '0010010000100100',
    '0010010000100000',
    '0000000000000000',
    '0100001001000010',
    '0011110000111100',
    '0000000000000000',
];