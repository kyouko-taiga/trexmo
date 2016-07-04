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
                .then((json) => {
                    if (response.status == 200) {
                        Dispatcher.dispatch({
                            actionType: 'LIST_MODELS',
                            response: normalize(json, arrayOf(Models.model))
                        })
                    } else {
                        throw new Error(json.message)
                    }
                })
        })
}


function getModel(name) {
    return fetch(`/models/${name}`, {
        headers: {
            'Accept': 'application/json',
            'X-Auth-Token': readCookie('Auth-Token')
        }
    })
        .then((response) => {
            return response.json()
                .then((json) => {
                    if (response.status == 200) {
                        Dispatcher.dispatch({
                            actionType: 'GET_MODEL',
                            response: normalize(json, Models.model)
                        })
                    } else {
                        throw new Error(json.message)
                    }
                })
        })
}


export default {
    list: listModels,
    get: getModel
}
