import 'whatwg-fetch'

import {normalize} from 'normalizr'

import Dispatcher from 'trexmo/Dispatcher'
import Models from 'trexmo/db/Models'

import {readCookie} from 'trexmo/utils/cookies'


function getForm(name) {
    return fetch(`/forms/${name}`, {
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
                            actionType: 'GET_FORM',
                            response: normalize(json, Models.form)
                        })
                    } else {
                        throw new Error(json.message)
                    }
                })
        })
}


function createFormState(name) {
    return fetch(`/forms/${name}/state`, {
        headers: {
            'Accept': 'application/json',
            'X-Auth-Token': readCookie('Auth-Token')
        }
    })
        .then((response) => {
            return response.json()
                .then((json) => {
                    if (response.status == 201) {
                        Dispatcher.dispatch({
                            actionType: 'GET_FORM_STATE',
                            response: json
                        })

                        // Return the UID of the new form state.
                        return json.uid
                    } else {
                        throw new Error(json.message)
                    }
                })
        })
}


function updateFormState(name, state, update) {
    return fetch(`/forms/${name}/state`, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Auth-Token': readCookie('Auth-Token')
        },
        body: JSON.stringify({
            state: state,
            update: update
        })
    })
        .then((response) => {
            return response.json()
                .then((json) => {
                    if (response.status == 200) {
                        Dispatcher.dispatch({
                            actionType: 'GET_FORM_STATE',
                            response: json
                        })
                    } else {
                        throw new Error(json.message)
                    }
                })
        })
}


export default {
    get: getForm,
    createFormState: createFormState,
    updateFormState: updateFormState
}
