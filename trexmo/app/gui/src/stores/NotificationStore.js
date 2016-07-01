import BaseStore from './BaseStore'


class NotificationStore extends BaseStore {
    constructor() {
        super()
        this.subscribe(() => this._registerToActions.bind(this))

        this._state = {
            level: 'danger',
            message: '',
            visible: false
        }
    }

    get state() {
        return this._state
    }

    SHOW_NOTIFICATION(action) {
        this._state.level = action.level
        this._state.message = action.message
        this._state.visible = true

        if (action.timeout != 0) {
            setTimeout(() => {
                this._state.visible = false
                this.emitChange()
            }, action.timeout)
        }

        this.emitChange()
    }

    HIDE_NOTIFICATION(action) {
        this._state.visible = false
        this.emitChange()
    }

    _registerToActions(action) {
        if (this[action.actionType]) {
            this[action.actionType](action)
        }
    }
}


export default new NotificationStore()
