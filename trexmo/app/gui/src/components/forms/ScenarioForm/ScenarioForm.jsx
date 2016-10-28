import React from 'react'
import {FormGroup, FormControl, ControlLabel} from 'react-bootstrap'

import ModelInput from './ModelInput'


export default class ScenarioForm extends React.Component {
    render() {
        return (
            <form onSubmit={this.props.onSubmit}>
                <FormGroup controlId="name">
                    <ControlLabel>Name of the scenario</ControlLabel>
                    <FormControl
                        onChange={this.props.onNameChange}
                        type="text"
                        placeholder="Name of the scenario"
                        value={this.props.name || ''}
                        required
                    />
                </FormGroup>
                <ModelInput
                    onChange={this.props.onModelChange}
                    controlId="model"
                    value={this.props.model}
                />
                <FormGroup controlId="substance">
                    <ControlLabel>Substance under examination</ControlLabel>
                    <FormControl
                        onChange={this.props.onSubstanceChange}
                        type="text"
                        placeholder="Name of the substance"
                        value={this.props.substance || ''}
                    />
                </FormGroup>
                <FormGroup controlId="cas">
                    <ControlLabel>CAS number</ControlLabel>
                    <FormControl
                        onChange={this.props.onCasChange}
                        type="text"
                        placeholder="CAS number of the substance"
                        value={this.props.cas || ''}
                    />
                </FormGroup>
            </form>
        )
    }
}
