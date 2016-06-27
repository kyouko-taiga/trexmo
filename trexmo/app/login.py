from flask import Blueprint
from flask import current_app, jsonify, render_template, request

from passlib.hash import pbkdf2_sha256

from sqlalchemy.orm.exc import NoResultFound

from trexmo.core.db.models import User
from trexmo.core.utils.auth import make_auth_token
from trexmo.core.utils.time import utcnow


bp = Blueprint('login', __name__)


@bp.route('/auth/tokens/', methods=['POST'])
def create_token():
    """
    .. http:post:: /auth/tokens/

        Create a new authentication token.

        :json username:
            The username of the user.
        :json password:
            The password of the user.

        :return:
            The created token and its estimated expiration date.

        :note:
            The extimated expiration date returned with the token is merely an
            indication for the client to know when it should expect to ask for
            a new token. However, it is possible that the token expires before
            the given date.
    """
    post_data = request.get_json(force=True)

    # Check if required fields have been provided.
    if not post_data.get('username'):
        return jsonify({'message': 'Missing username.'}), 403
    if not post_data.get('password'):
        return jsonify({'message': 'Missing password.'}), 403

    # Get the credentials.
    username = post_data['username']
    password = post_data['password']

    # Search for the user identified by the given username.
    try:
        user = User.query.filter(User.username == username).one()
    except NoResultFound:
        return jsonify({'message': 'Invalid username or password.'}), 403

    # Check the user password.
    if not pbkdf2_sha256.verify(password, user.password):
        return jsonify({'message': 'Invalid username or password.'}), 403

    # Generate a new token for the authenticated user.
    token = make_auth_token(user)

    return jsonify({
        'token': token,
        'expires_at': utcnow().timestamp() + current_app.config['AUTH_TOKEN_DURATION']
    }), 201


@bp.route('/login')
def login():
    return render_template('login.html')
