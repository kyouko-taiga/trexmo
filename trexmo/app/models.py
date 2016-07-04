from flask import Blueprint, current_app, jsonify

from trexmo.core.db.models import Model
from trexmo.core.utils.auth import require_auth
from trexmo.core.utils.http import jsonify_list


bp = Blueprint('models', __name__)


@bp.route('/models/')
@require_auth
def list_models(auth):
    """
    .. http:get:: /models/

        Return the list of models of exposure.

        :return:
            A list of :class:`~trexmo.core.db.models.model.Model` instances.
    """
    models = Model.all(current_app.config['MODELS_ROOT_DIR'])
    return jsonify_list([it.to_dict() for it in models])


@bp.route('/models/<name>', methods=['GET'])
@require_auth
def get_model_description(auth, name):
    """
    .. http:get:: /models/(name)

       Return a single model description, identified by its name.

        :param name:
            The name of model form description to retrieve.

        :return:
            An instance of
            :class:`~trexmo.core.db.models.model.Model`.
    """
    # Load the model description and return it.
    try:
        model = Model.get(current_app.config['MODELS_ROOT_DIR'], name)
    except KeyError:
        return jsonify({'message': 'Model description not found.'}), 404

    return jsonify(model.to_dict()), 200
