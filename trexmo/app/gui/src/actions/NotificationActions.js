import Bluebird from 'bluebird'

import Dispatcher from 'trexmo/Dispatcher'


function showNotification(message, level='danger', timeout=6000) {
    return new Bluebird((resolve, reject) => {
        Dispatcher.dispatch({
            actionType: 'SHOW_NOTIFICATION',
            message: message,
            level: level,
            timeout: timeout
        })
        resolve()
    })
}


function hideNotification() {
    return new Bluebird((resolve, reject) => {
        Dispatcher.dispatch({
            actionType: 'HIDE_NOTIFICATION'
        })
        resolve()
    })
}


export default {
    show: showNotification,
    hide: hideNotification
}
