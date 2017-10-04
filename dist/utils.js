'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.heart = undefined;
exports.printSelectedMessage = printSelectedMessage;
exports.getMessageTime = getMessageTime;
exports.initDayState = initDayState;

var _jsonfile = require('jsonfile');

var _jsonfile2 = _interopRequireDefault(_jsonfile);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var filePath = './messages.json';

function printSelectedMessage(printCallback) {
    var selectedMessage = '';
    _jsonfile2.default.readFile(filePath, function (error, messages) {
        if (messages) {
            var today = (0, _moment2.default)().format('DD/MM/YY');
            messages.forEach(function (message) {
                if (message.shouldBeDiplayOn === today || message.haveBeenDiplayedOn === today) {
                    selectedMessage = message;
                } else if (!message.haveBeenDiplayedOn && selectedMessage === '' && message.shouldBeDiplayOn === '') {
                    selectedMessage = message;
                }
            });
            messages[selectedMessage.id].haveBeenDiplayedOn = today;
            _jsonfile2.default.writeFile(filePath, messages, function (err) {
                if (err) {
                    console.error(err);
                }
            });
            printCallback(selectedMessage.content);
        }
    });
}
//
// export function getMessageTime() {
//     var messageTime = moment();
//     messageTime.set('hour', Math.floor(Math.random() * (23 - 19)) + 19);
//     messageTime.set('minute', Math.floor(Math.random() * (60)));
//     console.log("==========  New message time : " + messageTime.format("D/M/YY à H:mm:ss"));
//     return messageTime;
// }
function getMessageTime() {
    var messageTime = (0, _moment2.default)();
    messageTime.set('hour', Math.floor(Math.random() * (20 - 6)) + 6);
    messageTime.set('minute', Math.floor(Math.random() * 60));
    return messageTime;
}

function initDayState() {
    return {
        messageTime: getMessageTime(),
        shouldDiplayMessage: false,
        typedCode: '',
        now: (0, _moment2.default)(),
        lightWasOn: false,
        isTopOpen: false
    };
}

var heart = exports.heart = ['0110011001100110', '1001100110011001', '1000000110000001', '1000000110000001', '0100001001000010', '0010010000100100', '0001100000011000', '0000000000000000'];
//# sourceMappingURL=utils.js.map