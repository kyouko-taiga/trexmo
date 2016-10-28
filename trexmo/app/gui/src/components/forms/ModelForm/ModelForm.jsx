import React from 'react'
import {Alert} from 'react-bootstrap'

import FormActions from 'trexmo/actions/FormActions'
import ModelActions from 'trexmo/actions/ModelActions'

import StoreConnector from 'trexmo/connectors/StoreConnector'

import FormStore from 'trexmo/stores/FormStore'
import ModelStore from 'trexmo/stores/ModelStore'
import TranslationStore from 'trexmo/stores/TranslationStore'

import Field from './Field'


class ModelForm extends React.Component {
    constructor() {
        super()

        this.handleFieldChange = this.handleFieldChange.bind(this)
        this.stateUpdateDelays = {}
    }

    handleFieldChange(field, value) {
        const update = {[field]: value}

        let synchronizeState = () => {
            FormActions.updateFormState(this.props.model.name, this.props.formState, update)
                .catch((error) => {
                    console.error(error)
                })
        }

        if (this.props.form.fields[field].options.length == 0) {
            // If the field isn't a text input, we put a delay on the form
            // state synchronization, so as to prevent the UI from falling
            // behind the user input.
            if (this.stateUpdateDelays[field]) {
                clearTimeout(this.stateUpdateDelays[field])
            }
            this.stateUpdateDelays[field] = setTimeout(synchronizeState, 1000)

            // Manually dispatch the field change, so that the UI updates
            // optimistically.
            FormActions.updateFieldValue(this.props.formState.uid, field, value)
                .catch((error) => {
                    console.error(error)
                })
        } else {
            // If the field is a select input, we synchronize the form state
            // right away.
            synchronizeState()
        }

        // Notify the form change to the parent component.
        this.props.onChange(update)
    }

    render() {
        const form = this.props.form
        const form_state = this.props.formState

        // Check if the form determinants have been translated.
        const is_translated = (typeof this.props.translations !== 'undefined')
        const translations = is_translated
            ? this.props.translations
            : {}

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
                    isTranslated={is_translated}
                    translations={translations[field_name]}
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
            this._getForm(this.props.formName)
        }

        componentWillReceiveProps(props) {
            if (this.props.formName !== props.formName) {
                this._getForm(props.formName)
            }
        }

        render() {
            if (this.state.loading) {
                return <Alert bsStyle="info">Loading form data ...</Alert>
            }

            if (this.state.error !== null) {
                return <Alert bsStyle="danger">{this.state.error.message}</Alert>
            }

            const formState = FormStore.formState(this.state.formStateUid)
            return <ModelForm {...this.props} formState={formState} />
        }

        _getForm(formName) {
            this.setState({loading: true})
            FormActions.get(formName)
                .then(() => {
                    return FormActions.createFormState(formName)
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
                                    formName, state, values)
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
    },

    [FormStore, TranslationStore],
    (props) => ({
        form: FormStore.all()[props.model.form],
        translations: TranslationStore.all()[props.scenario.uid]
    })
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
            this._getModel(this.props.modelName)
        }

        componentWillReceiveProps(props) {
            if (this.props.modelName !== props.modelName) {
                this._getModel(props.modelName)
            }
        }

        render() {
            if (this.state.loading) {
                return <Alert bsStyle="info">Loading model data ...</Alert>
            }

            if (this.state.error !== null) {
                return <Alert bsStyle="danger">{this.state.error.message}</Alert>
            }

            return <FormLoader formName={this.props.model.form} {...this.props} />
        }

        _getModel(name) {
            this.setState({loading: true})
            ModelActions.get(name)
                .catch((error) => {
                    console.error(error)
                    this.setState({error: error})
                })
                .then(() => {
                    this.setState({loading: false})
                })
        }
    },

    ModelStore,
    (props) => ({model: ModelStore.all()[props.modelName]})
)


export default ModelLoader
