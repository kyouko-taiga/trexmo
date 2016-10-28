import assign from 'object-assign'
import moment from 'moment'

import React from 'react'
import {Row, Col, Alert, FormGroup, FormControl, ControlLabel} from 'react-bootstrap'

import ScenarioActions from 'trexmo/actions/ScenarioActions'

import TranslationStore from 'trexmo/stores/TranslationStore'

import ScenarioForm from './forms/ScenarioForm'
import ModelForm from './forms/ModelForm'


export default class Scenario extends React.Component {
    constructor(props) {
        super(props)

        this.state = {translating: false}

        this.handleDescriptionChange = this.handleDescriptionChange.bind(this)
        this.handleNameChange = this.handleNameChange.bind(this)
        this.handleModelChange = this.handleModelChange.bind(this)
        this.handleSubstanceChange = this.handleSubstanceChange.bind(this)
        this.handleCasChange = this.handleCasChange.bind(this)
        this.handleDeterminantsChange = this.handleDeterminantsChange.bind(this)
    }

    handleDescriptionChange(e) {
        ScenarioActions.update({
            uid: this.props.scenario.uid,
            description: e.target.value
        })
    }

    handleNameChange(e) {
        ScenarioActions.update({
            uid: this.props.scenario.uid,
            name: e.target.value
        })
    }

    handleModelChange(e) {
        const new_model = e.target.value

        this.setState({translating: true})
        ScenarioActions.translateDeterminants(this.props.scenario.uid, new_model)
            .then(() => {
                this.setState({translating: false})

                // Update the model and determinants of the scenario with the
                // computed translations.
                let values = {}
                const translations = TranslationStore.one(this.props.scenario.uid)
                for (let field_name in translations) {
                    // Ignore the internal variables.
                    if (field_name.startsWith('__') && field_name.endsWith('__')) {
                        continue
                    }

                    // Set the field value to the first translation.
                    if (translations[field_name].length > 0) {
                        values[field_name] = translations[field_name][0].value
                    }
                }

                return ScenarioActions.update({
                    uid: this.props.scenario.uid,
                    model: new_model,
                    determinants: assign(
                        this.props.scenario.determinants,
                        {[new_model]: values})
                })
            })
            .catch((error) => {
                console.error(error)
                this.setState({translating: false})
            })
    }

    handleSubstanceChange(e) {
        ScenarioActions.update({
            uid: this.props.scenario.uid,
            substance: e.target.value
        })
    }

    handleCasChange(e) {
        ScenarioActions.update({
            uid: this.props.scenario.uid,
            cas: e.target.value
        })
    }

    handleDeterminantsChange(values) {
        const determinants = this.props.scenario.determinants
        const model_determinants = determinants[this.props.scenario.model]

        const new_values = (typeof model_determinants !== 'undefined')
            ? assign(model_determinants, values)
            : values

        ScenarioActions.update({
            uid: this.props.scenario.uid,
            determinants: assign(determinants, {[this.props.scenario.model]: new_values})
        })
    }

    render() {
        const scenario = this.props.scenario

        let determinants
        if (this.state.translating) {
            determinants = (
                <Alert bsStyle="info">Translating determinants ...</Alert>   
            )
        } else {
            determinants = (
                <ModelForm
                    onChange={this.handleDeterminantsChange}
                    modelName={scenario.model}
                    scenario={scenario}
                />
            )
        }

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
                            value={scenario.description || ''}
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
                        {...scenario}
                    />
                </Col>
                <Col sm={12}>
                    {determinants}
                </Col>
            </Row>
        )
    }
}
