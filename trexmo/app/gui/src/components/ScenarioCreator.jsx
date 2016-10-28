import React from 'react'
import {Button, ButtonToolbar} from 'react-bootstrap'

import NotificationActions from 'trexmo/actions/NotificationActions'
import ScenarioActions from 'trexmo/actions/ScenarioActions'

import ScenarioForm from './forms/ScenarioForm'


export default class ScenarioCreator extends React.Component {
    constructor() {
        super()

        this.state = {
            collapsed: true
        }

        this.expand = this.expand.bind(this)
        this.collapse = this.collapse.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    expand() {
        this.setState({collapsed: false})
    }

    collapse() {
        this.setState({collapsed: true})
    }

    handleSubmit(data) {
        ScenarioActions.create(data)
            .then(() => {
                this.collapse()
            })
            .catch((error) => {
                console.error(error)
                NotificationActions.show(
                    <div>
                        <strong>Unable to create the exposure situation</strong>
                        <p>{error.message}</p>
                    </div>
                )
            })
    }

    render() {
        if (this.state.collapsed) {
            return (
                <div className="text-right">
                    <Button onClick={this.expand} bsStyle="success">
                        <i className="fa fa-fw fa-plus" />
                        Create new
                    </Button>
                </div>
            )
        } else {
            return (
                <ScenarioFormContainer
                    onSubmit={this.handleSubmit}
                    onCancel={this.collapse}
                />
            )
        }
    }    
}


class ScenarioFormContainer extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            name: '',
            substance: '',
            cas: '',
            model: ''
        }

        this.handleNameChange = this.handleNameChange.bind(this)
        this.handleSubstanceChange = this.handleSubstanceChange.bind(this)
        this.handleCasChange = this.handleCasChange.bind(this)
        this.handleModelChange = this.handleModelChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleNameChange(e) {
        this.setState({name: e.target.value})
    }

    handleSubstanceChange(e) {
        this.setState({substance: e.target.value})
    }

    handleCasChange(e) {
        this.setState({cas: e.target.value})
    }

    handleModelChange(e) {
        this.setState({model: e.target.value})
    }

    handleSubmit(e) {
        e.preventDefault()
        this.props.onSubmit(this.state)
    }

    render() {
        return (
            <div>
                <ScenarioForm
                    onNameChange={this.handleNameChange}
                    onModelChange={this.handleModelChange}
                    onSubstanceChange={this.handleSubstanceChange}
                    onCasChange={this.handleCasChange}
                    {...this.state}
                />
                <div className="text-right">
                    <ButtonToolbar>
                        <Button onClick={this.props.onCancel} bsStyle="danger">
                            Cancel
                        </Button>
                        <Button onClick={this.handleSubmit} bsStyle="success">
                            Create new
                        </Button>
                    </ButtonToolbar>
                </div>
            </div>
        )
    }
}
