import BaseStore from './BaseStore'


class ConfirmStore extends BaseStore {
    constructor() {
        super()
        this.subscribe(() => this._registerToActions.bind(this))

        this._state = {
            showModal: false,
            message: undefined
        }
    }

    get state() {
        return this._state
    }

    SHOW_CONFIRM(action) {
        this._state.showModal = true
        this._state.message = action.message

        this._state.resolve = (value) => {
            this._state.showModal = false
            this.emitChange()
            action.resolve(value)
        }

        this._state.reject = (error) => {
            this._state.showModal = false
            this.emitChange()
            action.reject(error)
        }

        this.emitChange()
    }

    _registerToActions(action) {
        if (this[action.actionType]) {
            this[action.actionType](action)
        }
    }
}


export default new ConfirmStore()
