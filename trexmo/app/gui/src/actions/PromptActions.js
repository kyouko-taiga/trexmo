import Bluebird from 'bluebird'

import Dispatcher from 'trexmo/Dispatcher'


function showPrompt(question) {
    return new Bluebird((resolve, reject) => {
        Dispatcher.dispatch({
            actionType: 'SHOW_PROMPT',
            question: question,
            resolve: resolve,
            reject: reject
        })
    })
}


export default {
    show: showPrompt
}
