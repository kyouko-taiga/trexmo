import React from 'react'
import {Button, ButtonToolbar} from 'react-bootstrap'

import NotificationActions from 'trexmo/actions/NotificationActions'
import ScenarioActions from 'trexmo/actions/ScenarioActions'


export default class ScenarioToolbar extends React.Component {
    constructor() {
        super()

        this.handleSave = this.handleSave.bind(this)
        this.handleDelete = this.handleDelete.bind(this)
    }

    handleSave() {
        ScenarioActions.save(this.props.uid)
            .catch((error) => {
                console.error(error)
            })
    }

    handleDelete() {
        ScenarioActions.delete(this.props.uid)
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
                    disabled={!this.props.modified}
                >
                    <i className="fa fa-fw fa-floppy-o" />Save
                </Button>
                <Button bsStyle="warning">
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
