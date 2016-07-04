import React from 'react'
import {Alert} from 'react-bootstrap'

import FormActions from 'trexmo/actions/FormActions'
import FormStore from 'trexmo/stores/FormStore'

import ModelActions from 'trexmo/actions/ModelActions'
import ModelStore from 'trexmo/stores/ModelStore'

import StoreConnector from 'trexmo/connectors/StoreConnector'

import Field from './Field'


class ModelForm extends React.Component {
    constructor() {
        super()

        this.handleFieldChange = this.handleFieldChange.bind(this)
    }

    handleFieldChange(field, value) {
        const update = {[field]: value}

        // Update the form state.
        FormActions.updateFormState(this.props.model.name, this.props.formState, update)
            .catch((error) => {
                console.error(error)
            })

        // Notify the form change to the parent component.
        this.props.onChange(update)
    }

    render() {
        const form = this.props.form
        const form_state = this.props.formState

        // Generate the form fields.
        let fields = []
        for (let field_name of form.fields_order) {
            // Ignore the field if one of its preconditions is not satisfied.
            let ignore = false
            for (let expr of form.fields[field_name].preconditions) {
                if (!form_state.preconditions[expr]) {
                    ignore = true
                    break
                }
            }
            if (ignore) {
                continue
            }

            // Generate the field.
            fields.push(
                <Field
                    onChange={this.handleFieldChange}
                    key={field_name}
                    field={form.fields[field_name]}
                    formState={form_state}
                />
            )
        }

        return (
            <div>
                <h4>Determinants for {form.label}</h4>
                <p className="text-muted">
                    {
                        'Please select the determinants by rows rather ' +
                        'than columns, and be sure enter a value for each ' +
                        'and every field by scrolling down the list.'
                    }
                    <br />
                    {
                        'If you perform a model translation, it may be ' +
                        'possible for a field to contain multiple ' +
                        'recomended values. Be sure to select the most ' +
                        'appropriate one for each and every field.'
                    }
                </p>
                {fields}
            </div>
        )
    }
}


const FormLoader = StoreConnector(
    class extends React.Component {
        constructor() {
            super()
            this.state = {
                loading: true,
                error: null,
                formStateUid: null
            }
        }

        componentDidMount() {
            FormActions.get(this.props.model.form)
                .then(() => {
                    return FormActions.createFormState(this.props.model.form)
                        .then((uid) => {
                            // Store the UID of the form state.
                            this.setState({formStateUid: uid})

                            // Update the form state if the scenario already
                            // has some determinants stored for the current
                            // form model.
                            const values = this.props.scenario.determinants[this.props.model.name]
                            if (typeof values !== 'undefined') {
                                const state = FormStore.formState(uid)
                                return FormActions.updateFormState(
                                    this.props.model.form, state, values)
                            }
                        })
                })
                .catch((error) => {
                    console.error(error)
                    this.setState({error: error})
                })
                .then(() => {
                    this.setState({loading: false})
                })
        }

        render() {
            if (this.state.loading) {
                return <span>Loading form data ...</span>
            }

            if (this.state.error !== null) {
                return <Alert bsStyle="danger">{this.state.error.message}</Alert>
            }

            const formState = FormStore.formState(this.state.formStateUid)
            return <ModelForm {...this.props} formState={formState} />
        }
    },

    FormStore,
    (props) => ({form: FormStore.all()[props.model.form]})
)


const ModelLoader = StoreConnector(
    class extends React.Component {
        constructor() {
            super()
            this.state = {
                loading: true,
                error: null
            }
        }

        componentDidMount() {
            ModelActions.get(this.props.scenario.model)
                .catch((error) => {
                    console.error(error)
                    this.setState({error: error})
                })
                .then(() => {
                    this.setState({loading: false})
                })
        }

        render() {
            if (this.state.loading) {
                return <span>Loading model data ...</span>
            }

            if (this.state.error !== null) {
                return <Alert bsStyle="danger">{this.state.error.message}</Alert>
            }

            return <FormLoader {...this.props} />
        }
    },

    ModelStore,
    (props) => ({model: ModelStore.all()[props.scenario.model]})
)


export default ModelLoader
