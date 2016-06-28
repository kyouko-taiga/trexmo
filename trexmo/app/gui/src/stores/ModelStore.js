import assign from 'object-assign'

import BaseStore from './BaseStore'


class ModelStore extends BaseStore {
    constructor() {
        super()
        this.subscribe(() => this._registerToActions.bind(this))
        this._models = {}
    }

    /** Return a single exposure model from its name. */
    one(name) {
        if (!this._models.hasOwnProperty(name)) {
            throw new Error(`Model not found: '${name}'.`)
        }
        return this._models[name]
    }

    /** Return the list of all exposure models. */
    all() {
        return this._models
    }

    LIST_MODELS(action) {
        // Update the local cache with the received data.
        const models = action.response.entities.models
        for (let it in models) {
            this._insertOrUpdate(models[it])
        }

        this.emitChange()
    }

    _insertOrUpdate(data) {
        if (this._models.hasOwnProperty(data.name)) {
            this._models[data.name] = assign(this._models[data.name], data)
        } else {
            this._models[data.name] = assign({}, data)
        }
    }

    _registerToActions(action) {
        if (this[action.actionType]) {
            this[action.actionType](action)
        }
    }
}


export default new ModelStore()
