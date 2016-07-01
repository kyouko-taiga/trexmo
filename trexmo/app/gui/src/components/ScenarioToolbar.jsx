import React from 'react'
import {Button, ButtonToolbar} from 'react-bootstrap'

import ScenarioActions from 'trexmo/actions/ScenarioActions'


export default class ScenarioToolbar extends React.Component {
    constructor() {
        super()

        this.handleSave = this.handleSave.bind(this)
    }

    handleSave() {
        ScenarioActions.save(this.props.uid)
            .catch((error) => {
                console.error(error)
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
                <Button bsStyle="danger">
                    <i className="fa fa-fw fa-trash" />Delete
                </Button>
                <Button bsStyle="primary">
                    <i className="fa fa-fw fa-play" />Run
                </Button>
            </ButtonToolbar>
        )
    }
}
