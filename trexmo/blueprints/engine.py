import datetime
import itertools
import pickle
import os
import re

import yaffel.parser

from collections.abc import Iterable
from flask import Blueprint
from flask import abort, jsonify, make_response, request, render_template

from trexmo import settings
from trexmo.db.models import FormDescription, ModelDescription, TranslationDescription
from trexmo.db.models import Determinant, Scenario
from trexmo.exceptions import ApiError


engine = Blueprint('engine', __name__, template_folder='templates')


def load_scenario(scenario):
    try:
        with open(os.path.join(settings.DATA_DIR, 'scenarii', scenario), 'rb') as f:
            return pickle.load(f)
    except:
        raise ApiError("The scenario '%s' doesn't exist or is corrupted" % scenario, 404)


def yaffelize(arg, datatype=None):
    datatype = datatype or type(arg)
    if issubclass(datatype, str):
        return '"' + arg + '"'
    else:
        return str(arg)


def eval_or_raise(expr):
    try:
        return yaffel.parser.parse(expr)
    except Exception as e:
        raise ApiError(str(e), status_code=500, data={'yaffel': expr})


@engine.errorhandler(ApiError)
def handle_api_error(error):
    return jsonify({
        'message': error.message,
        'code': error.code,
        'payload': error.payload
    }), error.code


@engine.route('/')
def dashboard():
    # Load scenario previews
    scenarii = []
    for file in os.listdir(os.path.join(settings.DATA_DIR, 'scenarii')):
        if file.startswith('.'):
            continue
        filename = os.path.join(settings.DATA_DIR, 'scenarii', file)
        with open(filename, 'rb') as f:
            scenarii.append(pickle.load(f))

    template_data = {
        'scenarii': scenarii,
        'models': ModelDescription.all().values()
    }
    return render_template('dashboard.html', **template_data)


@engine.route('/scenario/<sid>', methods=['GET'])
def show_scenario(sid):
    # Load the scenario
    scenario = load_scenario(sid)

    # Get the model and form descriptions of the scenario
    models = ModelDescription.all()
    model_description = models.get(scenario.model)
    form_description = FormDescription.get(model_description.form)

    # Get the saved determinants, if exist
    determinants = scenario.data.get(scenario.model, {})

    template_data = {
        'scenario': scenario,
        'models': models,
        'form': render_template('form.html', fd=form_description, values=determinants)
    }
    return render_template('scenario.html', **template_data)


@engine.route('/scenario/<sid>', methods=['POST'])
def update_scenario(sid):
    # Load the scenario
    scenario = load_scenario(sid)

    # Validate the scenario metadata (substance and model must be set)
    validation_errors = {}
    for v in ['substance', 'model']:
        if request.form.get(v, '') == '':
            validation_errors[v] = '%s is required' % v
    if validation_errors:
        raise ApiError('validation', data=validation_errors)

    # Update the scenario metadata
    scenario.description = request.form['description']
    scenario.substance = request.form['substance']
    scenario.cas = request.form['cas']
    scenario.model = request.form['model']

    # Load the available forms and models
    model_description = ModelDescription.get(scenario.model)
    form_description = FormDescription.get(model_description.form)

    # TODO: Validate the determinants form

    # Create a storage for determinants, unless it already exists
    if scenario.model not in scenario.data:
        scenario.data[scenario.model] = {}

    # Update all determinants, while checking for their validity
    for field in form_description.fields.values():
        # Check for a custom value first
        input_value = request.form.get(field.name + '_alt')
        if not input_value:
            input_value = request.form.get(field.name, field.default)

        try:
            # Try to parse the input value as a yaffel expression
            input_value = yaffel.parser.parse(input_value)[1]
        except: pass

        if field.required and not input_value:
            validation_errors[field.name] = '%s is required' % field.label
        scenario.data[scenario.model][field.name] = Determinant(input_value)

    if validation_errors:
        raise ApiError('validation', data=validation_errors)

    # Save the updated scenario
    spath = os.path.join(settings.DATA_DIR, 'scenarii', scenario.id)
    with open(spath, 'wb') as f:
        pickle.dump(scenario,f)

    return make_response('', 204)


@engine.route('/scenario/', methods=['POST'])
def create_scenario():
    # Validate the scenario metadata (name, substance and model must be set)
    fields = {}
    for v in ['name', 'substance', 'model']:
        if request.form.get(v, '') == '':
            fields[v] = '%s must be a non-empty string' % v
    if fields:
        raise ApiError('validation', payload=fields)

    # Create the new scenario
    name = request.form['name']
    substance = request.form['substance']
    cas = request.form['cas']
    model = request.form['model']
    scenario = Scenario(name=name, substance=substance, cas=cas, model=model)

    # Load the available forms and models
    model_description = ModelDescription.get(scenario.model)
    form_description = FormDescription.get(model_description.form)

    # Initialize the determinants
    scenario.data[scenario.model] = {
        field.name: Determinant(field.default) for field in form_description.fields.values()
    }

    # Save the new scenario to a file named after its ID
    filename = os.path.join(settings.DATA_DIR, 'scenarii', scenario.id)
    with open(filename, 'wb') as f:
        pickle.dump(scenario, f)

    return jsonify({'id': scenario.id}), 201


@engine.route('/scenario/<sid>', methods=['DELETE'])
def delete_scenario(sid):
    path = os.path.join(settings.DATA_DIR, 'scenarii', sid)
    if not os.path.isfile(path):
        raise ApiError("The scenario '%s' doesn't exist" % sid, 404)

    os.remove(path)
    return make_response('', 204)


@engine.route('/run/<sid>')
def run_scenario(sid):
    # Load the scenario
    scenario = load_scenario(sid)

    # Load the scenario model
    model = ModelDescription.get(scenario.model)
    determinants = scenario.data[scenario.model]

    def decapsulate(expr):
        # Since yaffel-py doesn't implement structs, it can't parse things such
        # as `form.some_property`. As a workaround, we replace every occurence
        # of this kind of construct by `form_some_property`, so it becomes a
        # plain variable.
        names = re.findall(r'([a-zA-Z_]\w*)\.([a-zA-Z_]\w*)', expr)
        for obj, prop in names:
            expr = expr.replace(obj + '.' + prop, obj + '_' + prop)
        return expr

    # Create the expression context
    context = ', '.join('form_%s=%s' % (k, yaffelize(d.value)) for k,d in determinants.items())

    # Translate the form values into scores
    scores = {}
    for s in model.scores:
        # Update the context according to the scores computed so far
        mappings = ['%s=%s' % (k, yaffelize(v)) for k,v in scores.items()]
        mappings = ', '.join(map(str, [context] + mappings))
        suffix   = ' for ' + mappings if mappings else ''

        for t in model.scores[s].data:
            if not t['cond']:
                expr = decapsulate(t['expr']) + suffix
                _, scores[s] = eval_or_raise(expr)
            else:
                # Test the satisfaction of the conditions, in the order of their appearance
                expr = decapsulate(t['cond']) + suffix
                _, satisfied = eval_or_raise(expr)
                if satisfied:
                    expr = decapsulate(t['expr']) + suffix
                    _, scores[s] = eval_or_raise(expr)

            # Stop looking for a score expression if we already found one
            if s in scores: break

        # If we couldn't find any score expression, the model can't be run
        if s not in scores:
            raise RuntimeError('The engine was unable to find an expression to compute ' + s)

    # Instanciate model expression for the computed scores
    mappings = ['%s=%s' % (k, yaffelize(v)) for k,v in scores.items()]
    mappings = ', '.join(map(str, [context] + mappings))
    suffix   = ' for ' + mappings if mappings else ''
    _, result = eval_or_raise(model.function + suffix)

    # Find the labels of each determinant
    form = FormDescription.get(model.form)
    for det, value in determinants.items():
        field = form.fields[det]
        if field.options:
            for option in field.options:
                if option.value == value:
                    determinants[det] = option.label
                    break

    return jsonify({
        'scenario': scenario.name,
        'model': model.label,
        'determinants': determinants,
        'result': str(result) + (' [%s]' % model.unit if model.unit else '')
    })


@engine.route('/translate/<sid>/<mid>')
def translate_scenario(sid, mid):
    # Load the scenario
    scenario = load_scenario(sid)

    # Load the appropriate translation model
    translation = TranslationDescription.get((scenario.model, mid))
    if translation is None:
        raise ApiError("No available translation from '%s' to '%s'." % (scenario.model, mid), 404)

    # Create a storage for the new model determinants, unless it already exists
    if not mid in scenario.data:
        scenario.data[mid] = {}

    determinants = scenario.data[scenario.model]

    def decapsulate(expr):
        # Since yaffel-py doesn't implement structs, it can't parse things such
        # as `form.some_property`. As a workaround, we replace every occurence
        # of this kind of construct by `form_some_property`, so it becomes a
        # plain variable.
        names = re.findall(r'([a-zA-Z_]\w*)\.([a-zA-Z_]\w*)', expr)
        for obj, prop in names:
            expr = expr.replace(obj + '.' + prop, obj + '_' + prop)
        return expr

    # Create the expression context
    context = ', '.join(
        '%s_%s=%s' % (scenario.model, k, yaffelize(d.value)) for k,d in determinants.items())
    suffix = ' for ' + context if context else ''

    # Loop through each source field to translate
    for src, trans in translation.transformations.items():
        src_name = src[len(scenario.model) + 1:]

        # Loop through each destination fields the source will be translated to
        for dst, dst_data in trans.fields.items():
            dst_name = dst[len(mid) + 1:]

            trans_det = Determinant(None)

            # Look for the appropriate translation
            for t in dst_data:
                if not t['cond']:
                    # TODO: generate the list of mappings
                    expr = decapsulate(t['expr']) + suffix
                    _, trans_value = eval_or_raise(expr)

                    if t['type'] == 'default':
                        trans_det.selection.append(trans_value)
                    elif t['type'] == 'experimental':
                        trans_det.exp_selection.append(trans_value)

                    # Use the first translation as the deteminant value
                    if trans_det.value is None:
                        trans_det.value = trans_value
                else:
                    expr = decapsulate(t['cond']) + suffix
                    _, satisfied = eval_or_raise(expr)

                    if satisfied:
                        expr = decapsulate(t['expr']) + suffix
                        _, trans_value = eval_or_raise(expr)

                        if t['type'] == 'default':
                            trans_det.selection.append(trans_value)
                        elif t['type'] == 'experimental':
                            trans_det.exp_selection.append(trans_value)

                        # Use the first translation as the deteminant value
                        if trans_det.value is None:
                            trans_det.value = trans_value

            if trans_det.value is not None:
                scenario.data[mid][dst_name] = trans_det

    # Update the scenario model
    scenario.model = mid

    # Return the new form
    model_description = ModelDescription.get(scenario.model)
    form_description = FormDescription.get(model_description.form)

    return render_template(
        'form.html', fd=form_description, values=scenario.data[mid], is_translated=True)


@engine.route('/form/<fid>')
def show_form(fid):
    # Load the available forms
    with open(os.path.join(settings.CACHE_DIR, 'forms'), 'rb') as f:
        forms = pickle.load(f)
    for form in forms:
        if form.name == fid:
            return HtmlForm(form)
    abort(404)


@engine.route('/yaffel/eval', methods=['POST'])
def yaffel_eval():
    datatype, value = eval_or_raise(request.data.decode('utf-8'))
    return jsonify({'datatype': datatype.__name__, 'value': value})
