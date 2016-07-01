import BaseStore from './BaseStore'


class PromptStore extends BaseStore {
    constructor() {
        super()
        this.subscribe(() => this._registerToActions.bind(this))

        this._state = {
            showModal: false,
            question: '',
            resolve: undefined,
            reject: undefined
        }
    }

    get state() {
        return this._state
    }

    SHOW_PROMPT(action) {
        this._state.showModal = true
        this._state.question = action.question

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


export default new PromptStore()
