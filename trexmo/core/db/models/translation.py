import os

from trexmo import settings
from trexmo.core.utils.loaders import ordered_loader

class TranslationDescription(object):

    def __init__(self, filename):
        self.parse(filename)

    def parse(self, filename):
        with open(filename, 'r', encoding='utf-8') as f:
            raw_data = ordered_loader(f)

        # required information
        if 'source' not in raw_data:
            raise SyntaxError('translation description files must contain a source model')
        self.source = raw_data['source']
        if 'destination' not in raw_data:
            raise SyntaxError('translation description files must contain a destination model')
        self.destination = raw_data['destination']

        # optional general information
        self.version = raw_data.get('version', None)

        # transformations
        self.transformations = {s: Transformation(s,t)
                                for s,t in raw_data.get('transformations', {}).items()}

    def __str__(self):
        return 'Translation from %s to %s' % (self.source, self.destination)

    @classmethod
    def all(cls, directory=None):
        translations = {}
        for filename in os.listdir(directory or settings.TRANS_ROOT_DIR):
            trans = cls(os.path.join(directory or settings.TRANS_ROOT_DIR, filename))
            translations[(trans.source, trans.destination)] = trans
        return translations

    @classmethod
    def get(cls, key, default=None, directory=None):
        return cls.all(directory=directory).get(key, default)

class Transformation(object):

    def __init__(self, name, raw_data):
        self.fields = {}
        for field in raw_data:
            # Ignore empty translations.
            if raw_data[field] is None:
                continue

            self.fields[field] = []

            for line in raw_data[field].get('default', []):
                self.fields[field].append(self._parse_line(line, 'default'))
            for line in raw_data[field].get('experimental', []):
                self.fields[field].append(self._parse_line(line, 'experimental'))

    def _parse_line(self, line, translation_type):
        try:
            # split the line as an <expression, condition> tuple
            t = line.split('if')
            return {
                'expr': t[0][t[0].index('as')+2:].strip(),
                'cond': t[1].strip() if len(t) > 1 else None,
                'type': translation_type
             }
        except AttributeError:
            raise SyntaxError('Invalid syntax "%s"' % line)
