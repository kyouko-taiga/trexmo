import assign from 'object-assign'

import BaseStore from './BaseStore'


class TranslationStore extends BaseStore {
    constructor() {
        super()
        this.subscribe(() => this._registerToActions.bind(this))
        this._translations = {}
    }

    /**
     * Return the last determinant translation that was stored for the
     * scenario identified by the given UID.
     */
    one(uid) {
        if (!this._translations.hasOwnProperty(uid)) {
            throw new Error(`Translation not found: '${uid}'.`)
        }
        return this._translations[uid]
    }

    /** Return the list of all translations. */
    all() {
        return this._translations
    }

    GET_DETERMINANTS_TRANSLATION(action) {
        this._translations[action.args.scenario] = assign(
            {__model__: action.args.model}, action.data)
        this.emitChange()
    }

    LIST_SCENARII(action) {
        let has_changed = false
        const scenarii = action.response.entities.scenarii
        for (let it in scenarii) {
            // If there's a stored translation for the retrieved scenario,
            // delete it if the model of the scenario has changed.
            if (this._translations.hasOwnProperty(it)) {
                if (this._translations[it].__model__ != scenarii[it].model.name) {
                    delete this._translations[it]
                    has_changed = true
                }
            }
        }

        if (has_changed) {
            this.emitChange()
        }
    }

    GET_SCENARIO(action) {
        this.LIST_SCENARII(action)
    }

    _registerToActions(action) {
        if (this[action.actionType]) {
            this[action.actionType](action)
        }
    }
}


export default new TranslationStore()
