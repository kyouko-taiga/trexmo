import React from 'react'
import {FormGroup, FormControl, ControlLabel, Button, ButtonToolbar} from 'react-bootstrap'

import ModelActions from 'trexmo/actions/ModelActions'
import NotificationActions from 'trexmo/actions/NotificationActions'
import ScenarioActions from 'trexmo/actions/ScenarioActions'

import StoreConnector from 'trexmo/connectors/StoreConnector'
import ModelStore from 'trexmo/stores/ModelStore'


export default StoreConnector(
    class ScenarioCreator extends React.Component {
        constructor() {
            super()

            this.state = {
                loading: true,
                collapsed: true
            }

            this.expand = this.expand.bind(this)
            this.collapse = this.collapse.bind(this)
            this.handleSubmit = this.handleSubmit.bind(this)
        }

        componentDidMount() {
            // Request the list of available exposure models.
            ModelActions.list()
                .catch((error) => {
                    console.error(error)
                })
                .then(() => {
                    this.setState({loading: false})
                })
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
                const disabled = Object.keys(this.props.models).length == 0
                const text = this.state.loading
                    ? 'Loading ...'
                    : 'Create new'

                return (
                    <div className="text-right">
                        <Button onClick={this.expand} bsStyle="success" disabled={disabled}>
                            {text}
                        </Button>
                    </div>
                )
            } else {
                return (
                    <ScenarioForm
                        onSubmit={this.handleSubmit}
                        onCancel={this.collapse}
                        models={this.props.models}
                    />
                )
            }
        }    
    },

    ModelStore,
    (props) => ({models: ModelStore.all()})
)


class ScenarioForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            name: '',
            substance: '',
            cas: '',
            model: ''
        }

        // Force the model to be set to one of the available values.
        if (typeof props.models !== 'undefined') {
            const models = Object.keys(props.models)
            if (models.length != 0) {
                this.state.model = models[0]
            }
        }

        this.handleNameChange = this.handleNameChange.bind(this)
        this.handleSubstanceChange = this.handleSubstanceChange.bind(this)
        this.handleCasChange = this.handleCasChange.bind(this)
        this.handleModelChange = this.handleModelChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    componentWillReceiveProps(props) {
        // Force the model to be set to one of the available values if it
        // hasn't been set yet.
        if ((this.state.model === '') && (typeof props.models !== 'undefined')) {
            const models = Object.keys(props.models)
            if (models.length != 0) {
                this.setState({model: models[0]})
            }
        }
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
        const models = Object.keys(this.props.models).map((name) => {
            const label = this.props.models[name].label
            return <option key={name} value={name}>{label}</option>
        })

        return (
            <form onSubmit={this.handleSubmit}>
                <FormGroup controlId="name">
                    <ControlLabel>Name of the scenario</ControlLabel>
                    <FormControl
                        onChange={this.handleNameChange}
                        type="text"
                        placeholder="Name of the scenario"
                        value={this.state.name}
                        required
                    />
                </FormGroup>
                <FormGroup controlId="substance">
                    <ControlLabel>Name of the substance</ControlLabel>
                    <FormControl
                        onChange={this.handleSubstanceChange}
                        type="text"
                        placeholder="Name of the substance"
                        value={this.state.substance}
                    />
                </FormGroup>
                <FormGroup controlId="cas">
                    <ControlLabel>CAS number of the substance</ControlLabel>
                    <FormControl
                        onChange={this.handleCasChange}
                        type="text"
                        placeholder="CAS number of the substance"
                        value={this.state.cas}
                    />
                </FormGroup>
                <FormGroup controlId="cas">
                    <ControlLabel>Model of exposure</ControlLabel>
                    <FormControl
                        onChange={this.handleModelChange}
                        componentClass="select"
                        placeholder="Model of exposure"
                        value={this.state.model}
                    >
                        {models}
                    </FormControl>
                </FormGroup>
                <div className="text-right">
                    <ButtonToolbar>
                        <Button onClick={this.props.onCancel} bsStyle="danger">
                            Cancel
                        </Button>
                        <Button type="submit" bsStyle="success">
                            Create new
                        </Button>
                    </ButtonToolbar>
                </div>
            </form>
        )
    }
}
