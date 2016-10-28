from flask import Blueprint
from flask import jsonify, request, render_template

from passlib.hash import pbkdf2_sha256

from trexmo.core.db import db_session
from trexmo.core.db.models import User


bp = Blueprint('signup', __name__)


@bp.route('/auth/users/', methods=['POST'])
def create_user():
    """
    .. http:post:: /auth/users/

        Create a new user.

        :json username:
            The username of the user.
        :json password:
            The password of the user.
        :json confirm:
            The confirmation of the password of the user.
    """
    post_data = request.get_json(force=True)

    # Check if required fields have been provided.
    if not post_data.get('username'):
        return jsonify({'message': 'Missing username.'}), 400
    if not post_data.get('password'):
        return jsonify({'message': 'Missing password.'}), 400
    if not post_data.get('confirm'):
        return jsonify({'message': 'Missing password confirmation.'}), 400

    # Get the credentials.
    username = post_data['username']
    password = post_data['password']
    confirm = post_data['confirm']

    # Make sure the password matches its confirmation.
    if password != confirm:
        return jsonify({'message': 'Password does not match is confirmation.'}), 400

    # Make sure the password is strong enough.
    if len(password) < 8:
        return jsonify({'message': 'Password is too short (minimum 8 characters).'}), 400

    # Search for the user identified by the given username.
    user = User.query.filter(User.username == username).first()
    if user is not None:
        return jsonify({'message': 'Username already used.'}), 400

    # Create the new user.
    new_user = User(
        username=post_data['username'],
        password=pbkdf2_sha256.encrypt(post_data['password']))
    db_session.add(new_user)
    db_session.commit()

    return '', 201


@bp.route('/sign-up')
def login():
    return render_template('app.html')
