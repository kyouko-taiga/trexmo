import assign from 'object-assign'

import BaseStore from './BaseStore'


class FormStore extends BaseStore {
    constructor() {
        super()
        this.subscribe(() => this._registerToActions.bind(this))

        this._forms = {}
        this._states = {}
    }

    /** Return a single form, identified by its name. */
    one(uid) {
        if (!this._forms.hasOwnProperty(name)) {
            throw new Error(`Form not found: '${name}'.`)
        }
        return this._forms[name]
    }

    /** Return the list of all form descriptions. */
    all() {
        return this._forms
    }

    /** Return a single form state, identified by its UID. */
    formState(uid) {
        if (!this._states.hasOwnProperty(uid)) {
            throw new Error(`Form state not found: '${uid}'.`)
        }
        return this._states[uid]
    }

    LIST_FORMS(action) {
        // Update the local cache with the received data.
        const forms = action.response.entities.forms
        for (let it in forms) {
            this._insertOrUpdate(forms[it])
        }

        this.emitChange()
    }

    GET_FORM(action) {
        this.LIST_FORMS(action)
    }

    GET_MODEL(action) {
        this.LIST_FORMS(action)
    }

    GET_FORM_STATE(action) {
        this._states[action.response.uid] = action.response
        this.emitChange()
    }

    _insertOrUpdate(data) {
        if (this._forms.hasOwnProperty(data.name)) {
            this._forms[data.name] = assign(this._forms[data.name], data)
        } else {
            this._forms[data.name] = assign({}, data)
        }
    }

    _registerToActions(action) {
        if (this[action.actionType]) {
            this[action.actionType](action)
        }
    }
}


export default new FormStore()
