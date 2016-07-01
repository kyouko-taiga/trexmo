import React from 'react'
import {Button, ButtonToolbar} from 'react-bootstrap'


export default class ScenarioToolbar extends React.Component {
    render() {
        return (
            <ButtonToolbar>
                <Button bsStyle="success">
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
