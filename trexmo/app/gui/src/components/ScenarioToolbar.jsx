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

        this.state = {running: false}

        this.handleSave = this.handleSave.bind(this)
        this.handleCopy = this.handleCopy.bind(this)
        this.handleDelete = this.handleDelete.bind(this)
        this.handleRun = this.handleRun.bind(this)
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

    handleRun() {
        this.setState({running: true})

        const uid = this.props.scenario.uid
        const url_prefix = 
            `${location.protocol}//${location.hostname}` +
            `${location.port ? ':' + location.port : ''}`

        // Create a new window to contain the report.
        let report_window = window.open(`${url_prefix}/scenarii/${uid}/running`, '_blank')
        report_window.blur()
        window.focus()

        ScenarioActions.run(uid)
            .then((report_id) => {
                const report_url = `${url_prefix}/scenarii/${uid}/reports/${report_id}`
                report_window.location.href = report_url
                report_window.focus()
            })
            .catch((error) => {
                console.error(error)

                // Close the report window and show the error that occured.
                report_window.close()
                NotificationActions.show(
                    <div>
                        <strong>Unable to run the exposure situation.</strong>
                        <p>{error.message}</p>
                    </div>
                )
            })
            .then(() => {
                this.setState({running: false})
            })
    }

    render() {
        const run_icon = this.state.running
            ? 'fa fa-fw fa-spinner fa-spin'
            : 'fa fa-fw fa-play'
        const run_disabled = this.state.running

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
                <Button onClick={this.handleRun} bsStyle="primary" disabled={run_disabled}>
                    <i className={run_icon} />Run
                </Button>
            </ButtonToolbar>
        )
    }
}
