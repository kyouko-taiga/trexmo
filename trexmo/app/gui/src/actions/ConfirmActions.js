import Bluebird from 'bluebird'

import Dispatcher from 'trexmo/Dispatcher'


function showConfirm(message) {
    return new Bluebird((resolve, reject) => {
        Dispatcher.dispatch({
            actionType: 'SHOW_CONFIRM',
            message: message,
            resolve: resolve,
            reject: reject
        })
    })
}


export default {
    confirm: showConfirm
}
