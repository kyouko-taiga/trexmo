import os

from flask import Blueprint, current_app, jsonify, request

from trexmo.core.db.models import Scenario
from trexmo.core.utils.auth import require_auth
from trexmo.core.utils.http import jsonify_list


bp = Blueprint('scenarii', __name__)


@bp.route('/scenarii/')
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
        cas=post_data.get('cas')
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
