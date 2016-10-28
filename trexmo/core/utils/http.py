import json

from flask import current_app, request


def jsonify_list(data):
    indent = None
    separators = (',', ':')

    if current_app.config['JSONIFY_PRETTYPRINT_REGULAR'] \
       and not request.is_xhr:
        indent = 2
        separators = (', ', ': ')

    # Note that we add '\n' to end of response
    # (see https://github.com/mitsuhiko/flask/pull/1262)
    rv = current_app.response_class(
        (json.dumps(data, indent=indent, separators=separators, cls=current_app.json_encoder),
         '\n'),
        mimetype='application/json')
    return rv
