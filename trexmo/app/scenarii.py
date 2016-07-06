import re
import os
import uuid

from flask import Blueprint, current_app, jsonify, render_template, request

from yaffel import parser

from trexmo.core.db.models import Model, Scenario
from trexmo.core.exc import YaffelEvalError
from trexmo.core.utils.auth import require_auth
from trexmo.core.utils.http import jsonify_list
from trexmo.core.utils.time import utcnow
from trexmo.core.utils.yaffel import parse_variables, yaffelize

from .forms import _compute_form_state


bp = Blueprint('scenarii', __name__)


@bp.errorhandler(YaffelEvalError)
def handle_yaffel_error(e):
    return jsonify({
        'message': "Unable to evaluate '%(expr)s': %(error)s." % {
            'expr': e.expression,
            'error': e.message
        }
    }), 400    


@bp.route('/scenarii/', methods=['GET'])
@require_auth
def list_scenarii(auth):
    """
    .. http:get:: /scenarii/

        Return the list of scenarii.

        :return:
            A list of :class:`~trexmo.core.db.models.scenario.Scenario`
            instances.
    """
    scenarii_root = os.path.join(current_app.config['SCENARII_ROOT_DIR'], auth)
    if (os.path.isdir(scenarii_root)):
        scenarii = Scenario.all(scenarii_root)
    else:
        scenarii = []

    return jsonify_list([it.to_dict() for it in scenarii])


@bp.route('/scenarii/', methods=['POST'])
@require_auth
def create_scenario(auth):
    """
    .. http:post:: /scenarii/

        Create a new scenarii.

        :json name:
            The name of the scenario (required).
        :json substance:
            The substance under consideration (optional).
        :json cas:
            The cas number of the substance under consideration (optional).
        :json model:
            The name of the model of exposure (required).
        :json description:
            The description of the scenario (optional).
        :json determinants:
            A dictionary containing the determinants to be updated (optional).

        :return:
            The created scenario as an instance of
            :class:`~trexmo.core.db.models.scenario.Scenario`.
    """
    post_data = request.get_json(force=True)

    # Check if required fields have been provided.
    if not post_data.get('name'):
        return jsonify({'message': 'Missing name.'}), 400
    if not post_data.get('model'):
        return jsonify({'message': 'Missing model.'}), 400

    # Create the new scenario.
    scenario = Scenario(
        name=post_data['name'],
        model=post_data['model'],
        substance=post_data.get('substance'),
        cas=post_data.get('cas'),
        description=post_data.get('description'),
        determinants=post_data.get('determinants')
    )

    # Make sure the directory for scenarii exists.
    scenarii_root = os.path.join(current_app.config['SCENARII_ROOT_DIR'], auth)
    if not os.path.isdir(scenarii_root):
        os.makedirs(scenarii_root)

    # Save the new scenario to a file named after its UID.
    filename = os.path.join(scenarii_root, scenario.uid)
    with open(filename, 'w') as f:
        scenario.save(f)

    return jsonify(scenario.to_dict()), 201


@bp.route('/scenarii/<uid>', methods=['GET'])
@require_auth
def get_scenario(auth, uid):
    """
    .. http:get:: /scenarii/(uid)

       Return a single scenario, identified by its UID.

        :param uid:
            The UID of the scenario to retrieve.

        :return:
            An instance of
            :class:`~trexmo.core.db.models.scenario.Scenario`.
    """
    # Make sure the scenario file exists.
    filename = os.path.join(current_app.config['SCENARII_ROOT_DIR'], auth, uid)
    if not os.path.exists(filename):
        return jsonify({'message': 'Scenario not found.'}), 404

    # Load the scenario and return it.
    with open(filename, 'r') as f:
        scenario = Scenario.load(f)

    return jsonify(scenario.to_dict()), 200
    

@bp.route('/scenarii/<uid>', methods=['POST'])
@require_auth
def save_scenario(auth, uid):
    """
    .. http:post:: /scenarii/(uid)

        Save a scenario identified by its UID, with the given data.

        :param uid:
            The UID of the scenario to save.

        :json name:
            The name of the scenario.
        :json substance:
            The substance under consideration.
        :json cas:
            The cas number of the substance under consideration.
        :json description:
            The description of the scenario.
        :json determinants:
            A dictionary containing the determinants to be updated.

    .. note::
        Note that the model of exposure of a scenario cannot be modified with
        this endpoint, as it requires the translation of its determinants. Use
        :func:`translate_scenario_determinants` instead.    
    """
    post_data = request.get_json(force=True)

    # Make sure the scenario file exists.
    filename = os.path.join(current_app.config['SCENARII_ROOT_DIR'], auth, uid)
    if not os.path.exists(filename):
        return jsonify({'message': 'Scenario not found.'}), 404

    # Load the scenario and update its values.
    with open(filename, 'r') as f:
        scenario = Scenario.load(f)

    scenario.name = post_data.get('name', scenario.name)
    scenario.substance = post_data.get('substance', scenario.substance)
    scenario.cas = post_data.get('cas', scenario.cas)
    scenario.description = post_data.get('description', scenario.description)
    scenario.determinants = post_data.get('determinants', scenario.determinants)

    # Save the updated scenario and return ot.
    with open(filename, 'w') as f:
        scenario.save(f)

    return jsonify(scenario.to_dict()), 200


@bp.route('/scenarii/<uid>', methods=['DELETE'])
@require_auth
def delete_scenario(auth, uid):
    """
    .. http:delete:: /scenarii/(uid)

        Delete a scenario, identified by its UID.

        :param uid:
            The UID of the scenario to delete.
    """
    # Make sure the scenario file exists.
    filename = os.path.join(current_app.config['SCENARII_ROOT_DIR'], auth, uid)
    if not os.path.exists(filename):
        return jsonify({'message': 'Scenario not found.'}), 404

    # Delete the scenario file.
    os.remove(filename)
    return '', 204


@bp.route('/scenarii/<uid>/run', methods=['GET'])
@require_auth
def run_scenario(auth, uid):
    """
    .. http:get:: /scenarii/(uid)/run

        Compute the exposure situation of a scenario identified by its UID.

        :param uid:
            The UID of the scenario for which compute the exposure situation.
    """
    # Make sure the scenario file exists.
    filename = os.path.join(current_app.config['SCENARII_ROOT_DIR'], auth, uid)
    if not os.path.exists(filename):
        return jsonify({'message': 'Scenario not found.'}), 404

    # Load the scenario.
    with open(filename, 'r') as f:
        scenario = Scenario.load(f)

    # We initialize the set of determinants with a value for all the form
    # fields, so as to make sure the score computation won't complain about
    # unbound variable for the fields that weren't used.
    form = scenario.model.form
    determinants = {
        name: (field.default or field.data_type()) for name, field in form.fields.items()}

    # Get the determinants for the model of exposure of the scenario.
    try:
        determinants.update(scenario.determinants[scenario.model.name])
    except KeyError:
        return jsonify({'message': 'No determinants for model %s.' % scenario.model.label}), 400

    # Generate an expression context with all the determinant values.
    context = [
        'form_%(name)s=%(value)s' % {'name': name, 'value': yaffelize(value, form[name].data_type)}
        for name, value in determinants.items()
    ]

    # Translate the form values into scores.
    scores = {}
    for score_name in scenario.model.scores:
        # Update the context with to the scores computed so far.
        scores_context = [
            '%(name)s=%(value)s' % {'name': name, 'value': yaffelize(value)}
            for name, value in scores.items()
        ]
        suffix = ' for ' + ', '.join(scores_context + context)

        # Look for the first satisfiable score translation.
        expr = None
        for it in scenario.model.scores[score_name].data:
            # Take the first translation that doesn't have any condition.
            if not it['cond']:
                expr = _flatten(it['expr']) + suffix
                break

            # Take the first translation whose condition is satisfied.
            condition = _flatten(it['cond']) + suffix
            (_, satisfied) = _yaffel(condition)

            if satisfied:
                expr = _flatten(it['expr']) + suffix
                break

        # Raise an error if we couldn't find any score translation.
        if expr is None:
            return jsonify(
                {'message': "Unable to find a score translation for '%s'." % score_name}), 400

        # Compute the score value.
        (_, scores[score_name]) = _yaffel(expr)

    # Instantiate model expression for the computed scores.
    scores_context = [
        '%(name)s=%(value)s' % {'name': name, 'value': yaffelize(value)}
        for name, value in scores.items()
    ]
    suffix = ' for ' + ', '.join(scores_context + context)

    # Compute the model result.
    (_, result) = _yaffel(scenario.model.function + suffix)

    # Compute the form state to extract the fields to display.
    form_state = _compute_form_state(form, determinants)
    fields = [
        name for name in form.fields_order
        if all(form_state['preconditions'][expr] for expr in form[name].preconditions)
    ]

    rv = {
        'model': scenario.model.name,
        'values': [{'name': name, 'value': determinants[name]} for name in fields],
        'result': result,
    }

    # Save the value of the execution in cache, so that reports may be
    # generated from it.
    report_id = uuid.uuid4().hex
    cache_key = current_app.config['CACHE_KEY_PREFIX'] + 'reports?' + report_id
    current_app.cache.set(cache_key, rv)

    # Return the result of the execution, along with the field values that
    # were used to compute it and the report ID.
    rv.update({'report_id': report_id})
    return jsonify(rv)


@bp.route('/scenarii/<uid>/reports/<rid>', methods=['GET'])
@require_auth
def get_report(auth, uid, rid):
    """
    .. http:get:: /scenarii/(uid)/reports/(rid)

       Return an exposure situation report, as a printable HTML page.

        :param uid:
            The UID of the scenario for which the exposure situation was
            computed.
        :param rid:
            The ID of the report, as obtained after calling
            :func:`run_scenario`.

        .. seealso:: :func:`run_scenario`
    """
    # Make sure the scenario file exists.
    filename = os.path.join(current_app.config['SCENARII_ROOT_DIR'], auth, uid)
    if not os.path.exists(filename):
        return jsonify({'message': 'Scenario not found.'}), 404

    # Load the scenario.
    with open(filename, 'r') as f:
        scenario = Scenario.load(f)

    # Retrieve the report data from cache.
    cache_key = current_app.config['CACHE_KEY_PREFIX'] + 'reports?' + rid
    report = current_app.cache.get(cache_key)
    if report is None:
        return jsonify({'message': 'Report not found.'}), 404

    # Load the model description.
    try:
        model = Model.get(current_app.config['MODELS_ROOT_DIR'], report['model'])
    except KeyError:
        return jsonify({'message': 'Model description not found.'}), 404

    # Get the value labels.
    for i in range(len(report['values'])):
        field = model.form[report['values'][i]['name']]
        for option in field.options:
            if option.value == report['values'][i]['value']:
                report['values'][i]['value'] = option.label
                break

    return render_template(
        'report.html',
        scenario=scenario,
        model=model,
        report=report,
        date=utcnow())


@bp.route('/scenarii/<uid>/running', methods=['GET'])
@require_auth
def get_running_screen(auth, uid):
    """
    .. http:get:: /scenarii/<uid>/running

       Return a loading page to be displayed when an exposure situation is
       being computed.

        :param uid:
            The UID of the scenario for which the exposure situation is being
            computed.
    """
    # Make sure the scenario file exists.
    filename = os.path.join(current_app.config['SCENARII_ROOT_DIR'], auth, uid)
    if not os.path.exists(filename):
        return jsonify({'message': 'Scenario not found.'}), 404

    # Load the scenario.
    with open(filename, 'r') as f:
        scenario = Scenario.load(f)

    return render_template('running.html', scenario=scenario)


def _yaffel(expr):
    try:
        return parser.parse(expr)
    except Exception as e:
        raise YaffelEvalError(expression=expr, message=str(e))


def _flatten(expr):
    # Since yaffel-py doesn't implement structs, it can't parse things such as
    # `form.some_property`. As a workaround, we replace every occurence of
    # this kind of construct by `form_some_property`, so it becomes a plain
    # variable.
    names = re.findall(r'([a-zA-Z_]\w*)\.([a-zA-Z_]\w*)', expr)
    for obj, prop in names:
        expr = expr.replace(obj + '.' + prop, obj + '_' + prop)
    return expr
