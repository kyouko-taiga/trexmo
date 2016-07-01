import 'whatwg-fetch'

import Bluebird from 'bluebird'

import {arrayOf, normalize} from 'normalizr'

import Dispatcher from 'trexmo/Dispatcher'
import Models from 'trexmo/db/Models'

import {readCookie} from 'trexmo/utils/cookies'


function listScenarii() {
    return fetch('/scenarii/', {
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
                            actionType: 'LIST_SCENARII',
                            response: normalize(json, arrayOf(Models.scenario))
                        })
                    } else {
                        throw new Error(json.message)
                    }
                })
        })
}


function getScenario(uid) {
    return fetch(`/scenarii/${uid}`, {
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
                            actionType: 'GET_SCENARIO',
                            response: normalize(json, Models.scenario)
                        })
                    } else {
                        throw new Error(json.message)
                    }
                })
        })
}


function createScenario(data) {
    return new Bluebird((resolve, reject) => {
        Dispatcher.dispatch({
            actionType: 'CREATE_SCENARIO',
            args: data
        })
        resolve()
    })
        .then(() => {
            return fetch('/scenarii/', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Auth-Token': readCookie('Auth-Token')
                },
                body: JSON.stringify(data)
            })
        })
        .then((response) => {
            return response.json()
                .then((json) => {
                    if (response.status == 201) {
                        Dispatcher.dispatch({
                            actionType: 'GET_SCENARIO',
                            response: normalize(json, Models.scenario)
                        })
                    } else {
                        throw new Error(json.message)
                    }
                })
        })
        .catch((error) => {
            Dispatcher.dispatch({
                actionType: 'CREATE_SCENARIO_FAILED',
                error: error
            })
            throw error
        })
}


export default {
    list: listScenarii,
    get: getScenario,
    create: createScenario
}
