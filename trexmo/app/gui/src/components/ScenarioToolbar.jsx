import assign from 'object-assign'

import React from 'react'
import {Button, ButtonToolbar} from 'react-bootstrap'

import ConfirmActions from 'trexmo/actions/ConfirmActions'
import NotificationActions from 'trexmo/actions/NotificationActions'
import PromptActions from 'trexmo/actions/PromptActions'
import ScenarioActions from 'trexmo/actions/ScenarioActions'


export default class ScenarioToolbar extends React.Component {
    constructor() {
        super()

        this.handleSave = this.handleSave.bind(this)
        this.handleCopy = this.handleCopy.bind(this)
        this.handleDelete = this.handleDelete.bind(this)
    }

    handleSave() {
        ScenarioActions.save(this.props.scenario.uid)
            .catch((error) => {
                console.error(error)
            })
    }

    handleCopy() {
        PromptActions.show('Name of the copy')
            .then((copy_name) => {
                if (copy_name !== null) {
                    const data = assign(this.props.scenario, {name: copy_name})
                    return ScenarioActions.create(data)
                        .then((uid) => {
                            window.location.href = `#scenarii/${uid}`
                        })
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }

    handleDelete() {
        ConfirmActions.confirm(<h4>Delete {this.props.scenario.name}?</h4>)
            .then((answer) => {
                if (answer) {
                    return ScenarioActions.delete(this.props.scenario.uid)
                }
            })
            .catch((error) => {
                console.error(error)
                NotificationActions.show(
                    <div>
                        <strong>Unable to delete the exposure situation</strong>
                        <p>{error.message}</p>
                    </div>
                )
            })
    }

    render() {
        return (
            <ButtonToolbar>
                <Button
                    onClick={this.handleSave}
                    bsStyle="success"
                    disabled={!this.props.scenario.__modified__}
                >
                    <i className="fa fa-fw fa-floppy-o" />Save
                </Button>
                <Button onClick={this.handleCopy} bsStyle="warning">
                    <i className="fa fa-fw fa-files-o" />Copy
                </Button>
                <Button onClick={this.handleDelete} bsStyle="danger">
                    <i className="fa fa-fw fa-trash" />Delete
                </Button>
                <Button bsStyle="primary">
                    <i className="fa fa-fw fa-play" />Run
                </Button>
            </ButtonToolbar>
        )
    }
}
