import React from 'react'
import {FormGroup, FormControl, ControlLabel, HelpBlock} from 'react-bootstrap'


export default class Field extends React.Component {
    constructor() {
        super()
        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(e) {
        this.props.onChange(this.props.field.name, e.target.value)
    }

    render() {
        const field = this.props.field
        const form_state = this.props.formState

        // Generate the form control.
        let control
        if (field.options.length > 0) {
            // Generate the field options.
            let options = []
            for (let it of field.options) {
                // Ignore the option if one of its precondition is
                // unsatisfied.
                let ignore = false
                for (let expr of it.preconditions) {
                    if (!form_state.preconditions[expr]) {
                        ignore = true
                        break
                    }
                }
                if (ignore) {
                    continue
                }

                // Create the option component.
                options.push(
                    <option key={it.value} value={it.value}>{it.label}</option>
                )
            }

            // Create a placeholder if no value has been provided.
            let value = form_state.values[field.name]
            if (!value) {
                value = 'placeholder'
                options.unshift(
                    <option key="placeholder" value="placeholder" disabled>Select a value</option>
                )
            }

            control = (
                <FormControl
                    onChange={this.handleChange}
                    componentClass="select"
                    value={value}
                >
                    {options}
                </FormControl>
            )
        } else {
            control = (
                <FormControl
                    onChange={this.handleChange}
                    type="text"
                    placeholder="Type a value here."
                    value={form_state.values[field.name] || ''}
                />
            )
        }

        // Check for the unsatified constraints of the field.
        let unsatisfied = []
        for (let expr in form_state.constraints[field.name]) {
            if (!form_state.constraints[field.name][expr]) {
                unsatisfied.push(
                    <HelpBlock key={expr}>
                        <i className="fa fa-fw fa-warning" />
                        {`Unsatisfied constraint: ${expr}`}
                    </HelpBlock>
                )
            }
        }

        return (
            <FormGroup controlId={field.name}>
                <ControlLabel>
                    {field.label}{field.required ? ' (*)' : null}
                </ControlLabel>
                {control}
                {unsatisfied}
            </FormGroup>
        )
    }
}
