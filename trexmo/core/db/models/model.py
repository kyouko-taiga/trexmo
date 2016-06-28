import os

from collections import OrderedDict

from flask import current_app

from trexmo.core.utils.loaders import ordered_loader

from . import Form

from ..dictionarization import Dictionarizable


class Model(Dictionarizable):

    _dictionarizable_attrs = ('name', 'label', 'version', 'unit', 'form', 'scores')

    def __init__(self, name=None, label=None, version=None, unit=None, form=None, scores=None):
        self.name = name
        self.label = label or name
        self.version = version
        self.unit = unit
        self.form = form
        self.scores = scores

    def __repr__(self):
        return '<Model %r>' % self.label

    @classmethod
    def load(cls, file):
        data = ordered_loader(file)
        rv = cls()

        # Parse the required data.
        if 'name' not in data:
            raise SyntaxError('Model description files must contain a name.')
        rv.name = data['name']

        if 'form' not in data:
            raise SyntaxError('Model description files must contain a reference to a form.')
        form_root = current_app.config['FORMS_ROOT_DIR']
        rv.form = Form.get(form_root, data['form'])

        if 'function' not in data:
            raise SyntaxError('Model description files must contain a function.')
        rv.function = data['function']

        # Parse the model scores.
        rv.scores = OrderedDict()
        for score_name, score_data in data.get('scores', {}).items():
            rv.scores[score_name] = Score.parse(score_data)

        # Parse the optional data.
        rv.label = data.get('label', rv.name)
        rv.version = data.get('version', None)
        rv.unit = data.get('unit', '')

        return rv

    @classmethod
    def all(cls, directory):
        # Note that we can't decorate this method with flask.ext.cache.memoize
        # because it will can loaded outside of an application context.
        cache_key = (
            current_app.config['CACHE_KEY_PREFIX'] + cls.__name__ + '.all?' + directory)
        rv = current_app.cache.get(cache_key)
        if rv is not None:
            return rv

        rv = []
        for filename in os.listdir(directory):
            if not filename.startswith('.'):
                with open(os.path.join(directory, filename), 'r') as f:
                    rv.append(cls.load(f))

        current_app.cache.set(cache_key, rv)
        return rv

    @classmethod
    def get(cls, directory, name):
        for model in cls.all(directory):
            if model.name == name:
                return model
        raise KeyError(name)


class Score(Dictionarizable):

    _dictionarizable_attrs = ('data', )

    def __init__(self, data):
        self.data = data

    @classmethod
    def parse(cls, data):
        # Parse each line of the raw list as a pair of (expression, condition).
        lines = []
        for line in data:
            try:
                # Split the line as an (expression, condition) pair.
                t = line.split('if')
                u = {'expr': t[0][t[0].index('as')+2:].strip(),
                     'cond': t[1].strip() if len(t) > 1 else None}
                lines.append(u)
            except AttributeError:
                raise SyntaxError('Invalid syntax "%s".' % line)

        return cls(lines)
