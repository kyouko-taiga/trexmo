from flask import Blueprint
from flask import abort, jsonify, make_response, request, render_template

from trexmo.core.db.models import Form


bp = Blueprint('forms_api', __name__, template_folder='templates')


def accept_json():
    """Returns whether or not the request asked for a JSON answer."""

    # Implementation details: Why check if json has a higher quality than HTML
    # and not just go with the best match? Because some browsers accept on */*
    # and we don't want to deliver JSON to an ordinary browser.

    best = request.accept_mimetypes.best_match(['application/json', 'text/html'])
    return (best == 'application/json') and\
        (request.accept_mimetypes[best] > request.accept_mimetypes['text/html'])


@bp.route('/<name>', methods=['GET'])
def get_form(name):
    form_description = Form.get(name)
    if form_description is None:
        abort(404)

    if accept_json():
        fd = jsonify(form_description.as_dict())
        

        return jsonify(form_description.as_dict())
    return render_template('form.html', fd=form_description, values={})
