import moment from 'moment'

import React from 'react'
import {Row, Col, FormGroup, FormControl, ControlLabel} from 'react-bootstrap'

import StoreConnector from 'trexmo/connectors/StoreConnector'

import ScenarioForm from './forms/ScenarioForm'


export default class Scenario extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            name: undefined,
            description: undefined,
            model: undefined,
            substance: undefined,
            cas: undefined
        }

        this.handleDescriptionChange = this.handleDescriptionChange.bind(this)
        this.handleNameChange = this.handleNameChange.bind(this)
        this.handleModelChange = this.handleModelChange.bind(this)
        this.handleSubstanceChange = this.handleSubstanceChange.bind(this)
        this.handleCasChange = this.handleCasChange.bind(this)
    }

    handleDescriptionChange(e) {
        this.setState({description: e.target.value})
        if (typeof this.props.onChange === 'function') {
            this.props.onChange()
        }
    }

    handleNameChange(e) {
        this.setState({name: e.target.value})
        if (typeof this.props.onChange === 'function') {
            this.props.onChange()
        }
    }

    handleModelChange(e) {
        this.setState({model: e.target.value})
        if (typeof this.props.onChange === 'function') {
            this.props.onChange()
        }
    }

    handleSubstanceChange(e) {
        this.setState({substance: e.target.value})
        if (typeof this.props.onChange === 'function') {
            this.props.onChange()
        }
    }

    handleCasChange(e) {
        this.setState({cas: e.target.value})
        if (typeof this.props.onChange === 'function') {
            this.props.onChange()
        }
    }

    formValues(props) {
        const state = this.state
        const scenario = props.scenario

        let rv = {}
        for (let prop in scenario) {
            rv[prop] = (typeof state[prop] !== 'undefined')
                ? state[prop]
                : scenario[prop]
        }

        return rv
    }

    render() {
        const values = this.formValues(this.props)

        return (
            <Row>
                <Col sm={6}>
                    <FormGroup controlId="description">
                        <ControlLabel>
                            <h4>Description</h4>
                        </ControlLabel>
                        <FormControl
                            onChange={this.handleDescriptionChange}
                            componentClass="textarea"
                            className="trxm-scenario-description"
                            placeholder="Type a description of the scenario here."
                            value={values.description}
                        >
                        </FormControl>
                    </FormGroup>
                </Col>
                <Col sm={6}>
                    <ScenarioForm
                        onNameChange={this.handleNameChange}
                        onModelChange={this.handleModelChange}
                        onSubstanceChange={this.handleSubstanceChange}
                        onCasChange={this.handleCasChange}
                        {...values}
                    />
                </Col>
            </Row>
        )
    }
}
