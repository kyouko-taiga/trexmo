import json
import os
import uuid

from functools import reduce

from flask import Blueprint, current_app, jsonify, request

from yaffel import parser

from trexmo.core.db.models import Form
from trexmo.core.utils.auth import require_auth
from trexmo.core.utils.yaffel import parse_variables, yaffelize


bp = Blueprint('forms', __name__)


def build_context(variables, form, values):
    """Build the context of a yaffel expression."""

    # Return the empty string (no context) if there aren't any variable.
    if not variables:
        return ''

    rv = ' for '

    # Append the value of each variable to the context.
    for variable in variables:
        field = form[variable]
        value = values[variable] or field.default or field.data_type()
        rv += variable + '=' + yaffelize(value, field.data_type) + ', '

    # Return the context, without the trailing coma.
    return rv.rstrip().rstrip(',')


def eval_constraints(name, field, values):
    rv = {}

    for expr in field.constraints:
        # If the value of the field is None, then we know that it won't
        # satisfy any of its constraints, since yaffel doesn't have a None
        # value.
        if values[name] is not None:
            try:
                (expr_type, expr_result) = parser.parse(
                    expr.replace('self', yaffelize(values[name], field.data_type)))
                assert expr_type == bool
            except SyntaxError:
                expr_result = False

            rv[expr] = expr_result
        else:
            rv[expr] = False

    return rv


@bp.route('/forms/<name>', methods=['GET'])
@require_auth
def get_form_description(auth, name):
    """
    .. http:get:: /forms/(uid)

       Return a single form description, identified by its name.

        :param name:
            The name of the form description to retrieve.

        :return:
            An instance of
            :class:`~trexmo.core.db.models.form.Form`.
    """
    # Load the form description and return it.
    try:
        form = Form.get(current_app.config['FORMS_ROOT_DIR'], name)
    except KeyError:
        return jsonify({'message': 'Form description not found.'}), 404

    return jsonify(form.to_dict()), 200


@bp.route('/forms/<name>/state', methods=['GET'])
@require_auth
def create_form_state(auth, name):
    """
    .. http:post:: /forms/(uid)/

        Compute the state of a form, namely the result of its constraints and
        preconditions, given its description and values.

        :param name:
            The name of the form description to use.

        :return:
            A dictionary representing form state.
    """
    # Load the form description.
    try:
        form = Form.get(current_app.config['FORMS_ROOT_DIR'], name)
    except KeyError:
        return jsonify({'message': 'Form description not found.'}), 404

    # Initialize all the values with the field defaults.
    values = {name: field.default for name, field in form.fields.items()}

    # Initialize the arrays of constraints and preconditions.
    constraints = {name: {} for name in form.fields.keys()}
    preconditions = {}

    for name, field in form.fields.items():
        # Evaluate the field constraints.
        constraints[name] = eval_constraints(name, field, values)

        # Evaluate the field (and field options) preconditions.
        exprs = (option.preconditions for option in field.options)
        exprs = field.preconditions + [e for el in exprs for e in el]

        for expr in exprs:
            if expr not in preconditions:
                # Compute the satisfiability of the precondition.
                variables = parse_variables(expr)
                (expr_type, expr_result) = parser.parse(
                    expr + build_context(variables, form, values))
                assert expr_type == bool

                # Add the precondition to the array.
                preconditions[expr] = expr_result

    # Build the form state.
    state = {
        'uid': uuid.uuid4().hex,
        'values': values,
        'constraints': constraints,
        'preconditions': preconditions
    }

    # Send the form state to the client.
    return jsonify(state), 201


@bp.route('/forms/<name>/state', methods=['PATCH'])
@require_auth
def update_form_state(auth, name):
    """
    .. http:post:: /forms/(uid)/

        Compute the update on the state of a form given, its current state.

        :param name:
            The name of the form description to use.

        :json state:
            The current state of the form.
        :json update:
            A dictionary with the values that changed from the current state.

        :return:
            A dictionary representing form state.
    """
    post_data = request.get_json(force=True)

    # Check if required fields have been provided.
    if not post_data.get('state'):
        return jsonify({'message': 'Missing form state.'}), 400
    if not post_data.get('update'):
        return jsonify({'message': 'Missing the update.'}), 400

    # Return the state "as-is" if there aren't any updated value.
    if not post_data['update']:
        return jsonify(state), 200

    # Load the form description.
    try:
        form = Form.get(current_app.config['FORMS_ROOT_DIR'], name)
    except KeyError:
        return jsonify({'message': 'Form description not found.'}), 404

    # Get the current state and update its values.
    state = post_data['state']
    state['values'].update(post_data['update'])

    # Re-evaluate the constraints for the updated fields.
    for name in post_data['update']:
        state['constraints'][name] = eval_constraints(name, form[name], state['values'])

    # Re-evaluate the preconditions for all fields (and field options).
    preconditions = {}
    for name, field in form.fields.items():
        exprs = (option.preconditions for option in field.options)
        exprs = field.preconditions + [e for el in exprs for e in el]

        for expr in exprs:
            if expr not in preconditions:
                # Compute the satisfiability of the precondition.
                variables = parse_variables(expr)
                (expr_type, expr_result) = parser.parse(
                    expr + build_context(variables, form, state['values']))
                assert expr_type == bool

                # Add the precondition to the array.
                preconditions[expr] = expr_result
    state['preconditions'] = preconditions

    # Send the form state to the client.
    return jsonify(state)
