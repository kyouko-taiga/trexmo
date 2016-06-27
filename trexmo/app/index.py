import pickle
import os

from flask import Blueprint
from flask import current_app, render_template

from trexmo.core.db.models import Model
from trexmo.core.utils.auth import require_auth


bp = Blueprint('index', __name__)


@bp.route('/')
@require_auth
def dashboard(auth):
    # Load scenario previews.
    scenarii_root = os.path.join(current_app.config['SCENARII_ROOT_DIR'], auth)
    scenarii = []

    if (os.path.isdir(scenarii_root)):
        for file in scenarii_root:
            if file.startswith('.'):
                continue            

        filename = os.path.join(scenarii_root, file)
        with open(filename, 'rb') as f:
            scenarii.append(pickle.load(f))

    template_data = {
        'scenarii': scenarii,
        'models': Model.all(current_app.config['MODELS_ROOT_DIR'])
    }
    return render_template('dashboard.html', **template_data)
