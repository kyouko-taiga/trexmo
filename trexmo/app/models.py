from flask import Blueprint
from flask import current_app

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
    """
    models = Model.all(current_app.config['MODELS_ROOT_DIR'])
    return jsonify_list([it.to_dict() for it in models])
