const moment = require('moment'); //for the time

function formatMessage(username, text) {

        return {
                username,
                text,
                time: moment().format('h:mm a')

        }
}

module.exports = formatMessage;