import os
import random

from flask import Blueprint
from flask import current_app, flash, redirect, request, render_template, url_for

from passlib.hash import pbkdf2_sha256

from sqlalchemy.orm.exc import NoResultFound

from werkzeug.utils import secure_filename

from trexmo.core.db import db_session
from trexmo.core.db.models import User
from trexmo.core.utils.auth import require_root_auth


bp = Blueprint('admin', __name__)


@bp.route('/admin')
@require_root_auth
def index(auth):
    # Get the list of users.
    users = User.query.all()

    # Get the file tree of DDTL sources.
    ddtl = {
        'Form': _ls(current_app.config['FORMS_ROOT_DIR']),
        'Model': _ls(current_app.config['MODELS_ROOT_DIR']),
        'Translation': _ls(current_app.config['TRANS_ROOT_DIR'])
    }

    return render_template('admin/index.html', users=users, ddtl=ddtl)


@bp.route('/admin/remove-user/<uid>')
@require_root_auth
def remove_user(auth, uid):
    try:
        user = User.query.filter(User.uid == uid).one()
    except NoResultFound:
        return render_template('admin/error.html', message='User not found.')

    db_session.delete(user)
    db_session.commit()

    flash("User '%s' deleted." % user.username)
    return redirect(url_for('admin.index'))


@bp.route('/admin/reset-password/<uid>')
@require_root_auth
def reset_password(auth, uid):
    try:
        user = User.query.filter(User.uid == uid).one()
    except NoResultFound:
        return render_template('admin/error.html', message='User not found.')

    # Generate a random password.
    password = random.sample('abcdefghijklmnopqrstuvwxyz0123456789', 12)
    password = '-'.join(''.join(password[i:i+3]) for i in range(0, 12, 3))
    user.password = pbkdf2_sha256.encrypt(password)
    db_session.commit()

    flash("Changed the password of '%s' to '%s'." % (user.username, password))
    return redirect(url_for('admin.index'))


@bp.route('/admin/add-ddtl', methods=['POST'])
@require_root_auth
def add_ddtl(auth):
    category = request.form.get('category')
    directory = _directory_from_category(category)
    if directory is None:
        return render_template('admin/error.html', message="Invalid category '%s'." % category)

    # Check if the POST request contains a file.
    print(request.files)
    if 'source' not in request.files:
        return render_template('admin/error.html', message='No source file.')

    # If the suer does not select a file, some browser still submit an empty
    # part without filename.
    source = request.files['source']
    if source.filename == '':
        return render_template('admin/error.html', message='No source file.')

    # Make sure the source file has an appropriate extension.
    filename = source.filename
    if (not '.' in filename) or (filename.rsplit('.', 1)[1] not in ['txt', 'mdf', 'fdf', 'tdf']):
        return render_template('admin/error.html', message='Invalid file.')

    filename = secure_filename(source.filename)
    source.save(os.path.join(directory, filename))

    flash("DDTL source '%s' added." % source.filename)
    return redirect(url_for('admin.index'))


@bp.route('/admin/remove-ddtl/<category>/<filename>')
@require_root_auth
def remove_ddtl(auth, category, filename):
    directory = _directory_from_category(category.lower())
    if directory is None:
        return render_template('admin/error.html', message="Invalid category '%s'." % category)

    os.remove(os.path.join(directory, filename))

    flash("DDTL source '%s' deleted." % filename)
    return redirect(url_for('admin.index'))


def _ls(dirname):
    return filter(
        lambda filename: not filename.startswith('.'),
        os.listdir(dirname))


def _directory_from_category(category):
    if category == 'form':
        return current_app.config['FORMS_ROOT_DIR']
    if category == 'model':
        return current_app.config['MODELS_ROOT_DIR']
    if category == 'translation':
        return current_app.config['TRANS_ROOT_DIR']

    return None
