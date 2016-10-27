import pickle
import os

from flask import Blueprint
from flask import current_app, render_template

from trexmo.core.db.models import Model
from trexmo.core.utils.auth import require_auth


bp = Blueprint('index', __name__)


@bp.route('/')
@require_auth
def index(auth):
    return render_template('app.html')
