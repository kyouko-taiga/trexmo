import assign from 'object-assign'

import BaseStore from './BaseStore'


class ScenarioStore extends BaseStore {
    constructor() {
        super()
        this.subscribe(() => this._registerToActions.bind(this))
        this._scenarii = {}

        // Keep track of the previous state, so the store can roll back if an
        // optimistic update fails or aborts.
        this._rollback = {}
    }

    /** Return a single scenario from its UID. */
    one(uid) {
        if (!this._scenarii.hasOwnProperty(uid)) {
            throw new Error(`Scenario not found: '${uid}'.`)
        }
        return this._scenarii[uid]
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
            this._scenarii[it].__modified__ = false
        }

        this.emitChange()
    }

    GET_SCENARIO(action) {
        this.LIST_SCENARII(action)
    }

    UPDATE_SCENARIO(action) {
        const data = action.data

        if (!this._scenarii.hasOwnProperty(data.uid)) {
            // Store the scenario if we didn't have it yet.
            this._scenarii[data.uid] = assign({__modified__: true}, data)
        } else {
            let scenario = this._scenarii[data.uid]

            // If the scenario we have comes from the DB, we store its current
            // state and mark it as modified.
            if (!scenario.__modified__) {
                this._rollback[data.uid] = assign({}, scenario)
                scenario.__modified__ = true
            }

            // Update the state of the scenario.
            this._scenarii[data.uid] = assign(scenario, data)
        }

        this.emitChange()
    }

    DELETE_SCENARIO(action) {
        delete this._scenarii[action.args.uid]
        delete this._rollback[action.args.uid]
        this.emitChange()
    }

    _insertOrUpdate(data) {
        if (this._scenarii.hasOwnProperty(data.uid)) {
            this._scenarii[data.uid] = assign(this._scenarii[data.uid], data)
        } else {
            this._scenarii[data.uid] = assign({__modified__: false}, data)
        }
    }

    _registerToActions(action) {
        if (this[action.actionType]) {
            this[action.actionType](action)
        }
    }
}


export default new ScenarioStore()
