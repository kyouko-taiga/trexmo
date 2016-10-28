import {Schema, arrayOf} from 'normalizr'


// First, we define a schema for all entities.
let model = new Schema('models', {idAttribute: 'name'})
let form = new Schema('forms', {idAttribute: 'name'})
let scenario = new Schema('scenarii', {idAttribute: 'uid'})


// Then, we define the nesting rules.
model.define({
    form: form
})


export default {
    model: model,
    form: form,
    scenario: scenario
}
