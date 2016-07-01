import React from 'react'
import {FormGroup, FormControl, ControlLabel} from 'react-bootstrap'

import ModelActions from 'trexmo/actions/ModelActions'

import StoreConnector from 'trexmo/connectors/StoreConnector'
import ModelStore from 'trexmo/stores/ModelStore'


export default StoreConnector(
    class ModelInputContainer extends React.Component {
        constructor() {
            super()

            this.state = {
                loading: true,
                error: null
            }
        }

        componentDidMount() {
            if (Object.keys(this.props.models).length == 0) {
                ModelActions.list()
                    .catch((error) => {
                        console.error(error)
                        this.setState({error: error})
                    })
            }
        }

        render() {
            // If an error occured while loading the list of models, we show
            // it instead of the form control.
            if (this.state.error) {
                return (
                    <ModelFormGroup controlId={this.props.controlId} validationState="error">
                        <FormControl.Static>
                            <i className="fa fa-fw fa-warning" />
                            Unable to load the list of models of exposure.
                        </FormControl.Static>
                    </ModelFormGroup>
                )
            }

            if (Object.keys(this.props.models).length == 0) {
                // If we are loading the list of models and don't have
                // anything to show yet, we show the loading state.
                if (this.state.loading) {
                    return (
                        <ModelFormGroup controlId={this.props.controlId}>
                            <FormControl.Static>
                                <i className="fa fa-fw fa-spin fa-spinner" />
                                Loading ...
                            </FormControl.Static>
                        </ModelFormGroup>
                    )
                }

                // Simply show that there aren't any available model.
                return (
                    <ModelFormGroup controlId={this.props.controlId}>
                        <FormControl.Static>
                            <i className="fa fa-fw fa-info" />
                            No models available.
                        </FormControl.Static>
                    </ModelFormGroup>
                )
            }

            // Show the form control.
            return (
                <ModelFormGroup controlId={this.props.controlId}>
                    <ModelFormControl
                        onChange={this.props.onChange}
                        models={this.props.models}
                        value={this.props.value}
                    />
                </ModelFormGroup>
            )
        }    
    },

    ModelStore,
    (props) => ({models: ModelStore.all()})
)


class ModelFormGroup extends React.Component {
    render() {
        return (
            <FormGroup
                controlId={this.props.controlId}
                validationState={this.props.validationState}
            >
                <ControlLabel>Model of exposure</ControlLabel>
                {this.props.children}
            </FormGroup>
        )
    }
}


class ModelFormControl extends React.Component {
    render() {
        // Build the list of options.
        const model_values = Object.keys(this.props.models)
        let options = model_values.map((name) => {
            const label = this.props.models[name].label
            return <option key={name} value={name}>{label}</option>
        })

        // Create a placeholder if no value has been provided.
        if (!this.props.value) {
            options.unshift(
                <option key="placeholder" selected disabled>Model of exposure</option>
            )
        }

        return (
            <FormControl
                onChange={this.props.onChange}
                componentClass="select"
                value={this.props.value}
            >
                {options}
            </FormControl>
        )
    }
}
