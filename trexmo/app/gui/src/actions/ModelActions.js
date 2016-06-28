import 'whatwg-fetch'

import {arrayOf, normalize} from 'normalizr'

import Dispatcher from 'trexmo/Dispatcher'
import Models from 'trexmo/db/Models'

import {readCookie} from 'trexmo/utils/cookies'


function listModels() {
    return fetch('/models/', {
        headers: {
            'Accept': 'application/json',
            'X-Auth-Token': readCookie('Auth-Token')
        }
    })
        .then((response) => {
            return response.json()
        })
        .then((json) => {
            Dispatcher.dispatch({
                actionType: 'LIST_MODELS',
                response: normalize(json, arrayOf(Models.model))
            })
        })
}


export default {
    list: listModels
}
