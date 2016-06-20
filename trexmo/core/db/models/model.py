import os

from collections import OrderedDict
from trexmo import settings
from trexmo.core.utils.loaders import ordered_loader

class ModelDescription(object):

    def __init__(self, filename):
        self.parse(filename)

    def parse(self, filename):
        with open(filename, 'r', encoding='utf-8') as f:
            raw_data = ordered_loader(f)

        # required information
        if 'name' not in raw_data:
            raise SyntaxError('model description files must contain a name')
        self.name = raw_data['name']
        if 'form' not in raw_data:
            raise SyntaxError('model description files must contain a reference to a form')
        self.form = raw_data['form']
        if 'function' not in raw_data:
            raise SyntaxError('model description files must contain a function')
        self.function = raw_data['function']

        # optional general information
        self.label = raw_data.get('label', self.name)
        self.version = raw_data.get('version', None)
        self.unit = raw_data.get('unit', '')

        # model 'scores' and evaluation function
        self.scores = OrderedDict()
        for s,t in raw_data.get('scores', {}).items():
            self.scores[s] = ScoreDescription(s,t)

    def __str__(self):
        rets = 'Model of %s (%s)\n' % (self.name, self.label)
        rets += '\tE = ' + self.function
        return rets

    @classmethod
    def all(cls, directory=None):
        models = {}
        for filename in os.listdir(directory or settings.MODELS_ROOT_DIR):
            model = cls(os.path.join(directory or settings.MODELS_ROOT_DIR, filename))
            models[model.name] = model
        return models

    @classmethod
    def get(cls, name, default=None, directory=None):
        for filename in os.listdir(directory or settings.MODELS_ROOT_DIR):
            model = cls(os.path.join(directory or settings.MODELS_ROOT_DIR, filename))
            if model.name == name:
                return model
        return default

class ScoreDescription(object):

    def __init__(self, name, raw_data):
        # parse each line of the raw list as a pair of <expression, condition>
        self.data = []
        for line in raw_data:
            try:
                # split the line as an <expression, condition> tuple
                t = line.split('if')
                u = {'expr': t[0][t[0].index('as')+2:].strip(),
                     'cond': t[1].strip() if len(t) > 1 else None}
                self.data.append(u)
            except AttributeError:
                raise SyntaxError('Invalid syntax "%s"' % line)
        # self.conversions = [r.match(line).groupdict() for line in raw_data]
