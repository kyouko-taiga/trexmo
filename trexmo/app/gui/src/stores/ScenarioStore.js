import assign from 'object-assign'

import BaseStore from './BaseStore'


class ScenarioStore extends BaseStore {
    constructor() {
        super()
        this.subscribe(() => this._registerToActions.bind(this))
        this._scenarii = {}
    }

    /** Return a single scenario from its name. */
    one(name) {
        if (!this._models.hasOwnProperty(uid)) {
            throw new Error(`Scenario not found: '${uid}'.`)
        }
        return this._models[uid]
    }

    /** Return the list of all scenarii. */
    all() {
        return this._scenarii
    }

    LIST_SCENARII(action) {
        // Update the local cache with the received data.
        const scenarii = action.response.entities.scenarii
        for (let it in scenarii) {
            this._insertOrUpdate(scenarii[it])
        }

        this.emitChange()
    }

    GET_SCENARIO(action) {
        this.LIST_SCENARII(action)
    }

    _insertOrUpdate(data) {
        if (this._scenarii.hasOwnProperty(data.uid)) {
            this._scenarii[data.uid] = assign(this._scenarii[data.uid], data)
        } else {
            this._scenarii[data.uid] = assign({}, data)
        }
    }

    _registerToActions(action) {
        if (this[action.actionType]) {
            this[action.actionType](action)
        }
    }
}


export default new ScenarioStore()
