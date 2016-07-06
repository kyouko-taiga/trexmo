import 'whatwg-fetch'

import Bluebird from 'bluebird'

import {arrayOf, normalize} from 'normalizr'

import Dispatcher from 'trexmo/Dispatcher'
import Models from 'trexmo/db/Models'
import ScenarioStore from 'trexmo/stores/ScenarioStore'

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
                        // Dispatch a GET_SCENARIO action to store the new
                        // scenario.
                        Dispatcher.dispatch({
                            actionType: 'GET_SCENARIO',
                            response: normalize(json, Models.scenario)
                        })

                        // Return the UID of the new scenario.
                        return json.uid
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


function updateScenario(data) {
    return new Bluebird((resolve, reject) => {
        Dispatcher.dispatch({
            actionType: 'UPDATE_SCENARIO',
            data: data
        })
        resolve()
    })
}


function saveScenario(uid) {
    return fetch(`/scenarii/${uid}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Auth-Token': readCookie('Auth-Token')
        },
        body: JSON.stringify(ScenarioStore.one(uid))
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


function deleteScenario(uid) {
    Dispatcher.dispatch({
        actionType: 'DELETE_SCENARIO',
        args: {uid: uid}
    })

    return fetch(`/scenarii/${uid}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'X-Auth-Token': readCookie('Auth-Token')
        }
    })
}


function runScenario(uid) {
    return fetch(`/scenarii/${uid}/run`, {
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
                            actionType: 'RUN_SCENARIO',
                            response: json
                        })
                    } else {
                        throw new Error(json.message)
                    }

                    // Return the UID of the execution report.
                    return json.report_id
                })
        })
}


export default {
    list: listScenarii,
    get: getScenario,
    create: createScenario,
    update: updateScenario,
    save: saveScenario,
    delete: deleteScenario,
    run: runScenario
}
