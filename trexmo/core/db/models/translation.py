import os

from trexmo.core.utils.loaders import ordered_loader

from ..cached import Cached
from ..dictionarization import Dictionarizable


class Translation(Cached, Dictionarizable):

    _dictionarizable_attrs = ('source', 'destination', 'transformations')

    def __init__(self, source=None, destination=None, transformations=None):
        self.source = source
        self.destination = destination
        self.transformations = transformations or {}

    def __repr__(self):
        return '<Translation %r -> %r>' % (self.source, self.destination)

    @classmethod
    def load(cls, file):
        rv = cls.load_from_cache(file)
        if rv is not None:
            return rv

        data = ordered_loader(file)
        rv = cls()

        # Parse the required data.
        if 'source' not in data:
            raise SyntaxError('Translation description files must contain a source model.')
        rv.source = data['source']

        if 'destination' not in data:
            raise SyntaxError('Translation description files must contain a destination model.')
        rv.destination = data['destination']

        # Parse the transformations.
        rv.transformations = {
            src: Transformation.parse(trans)
            for src, trans in data.get('transformations', {}).items()
        }

        # Parse the optional data.
        rv.version = data.get('version', None)

        cls.save_to_cache(file, rv)
        return rv

    @classmethod
    def all(cls, directory):
        rv = []
        for filename in os.listdir(directory):
            if not filename.startswith('.'):
                with open(os.path.join(directory, filename), 'r') as f:
                    rv.append(cls.load(f))

        return rv

    @classmethod
    def get(cls, directory, source, destination):
        for trans in cls.all(directory):
            if (trans.source == source) and (trans.destination == destination):
                return trans
        raise KeyError((source, destination))


class Transformation(Dictionarizable):

    _dictionarizable_attrs = ('fields', )

    def __init__(self, fields=None):
        self.fields = fields or {}

    @classmethod
    def parse(cls, data):
        rv = cls()

        for field in data:
            # Ignore empty transformations.
            if data[field] is None:
                continue

            rv.fields[field] = []

            for translation_type in data[field]:
                for line in data[field][translation_type]:
                    rv.fields[field].append(cls._parse_line(line, translation_type))

        return rv

    @classmethod
    def _parse_line(cls, line, translation_type):
        try:
            # Split the line as an (expression, condition) pair.
            t = line.split('if')
            return {
                'expr': t[0][t[0].index('as')+2:].strip(),
                'cond': t[1].strip() if len(t) > 1 else None,
                'type': translation_type
             }
        except AttributeError:
            raise SyntaxError('Invalid syntax "%s".' % line)
