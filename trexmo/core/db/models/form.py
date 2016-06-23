import os

import yaffel.parser

from collections import Mapping, OrderedDict

from flask import current_app

from trexmo.core.utils.loaders import ordered_loader

from ..dictionarization import Dictionarizable


class Form(Dictionarizable):

    _dictionarizable_attrs = ('name', 'label', 'version', 'fields')

    def __init__(self, name=None, label=None, version=None, fields=None):
        self.name = name
        self.label = label or name
        self.version = version
        self.fields = fields

    def __getitem__(self, name):
        return self.fields[name]

    def __repr__(self):
        return '<Form %r>' % self.label

    @classmethod
    def load(cls, file):
        data = ordered_loader(file)
        rv = cls()

        # Parse the required data.
        if 'name' not in data:
            raise SyntaxError('Form description files must contain a name.')
        rv.name = data['name']

        # Parse the form fields.
        rv.fields = OrderedDict()
        for field_name, field_data in data.get('fields', {}).items():
            rv.fields[field_name] = Field.parse(field_name, field_data)

        # Parse the optional data.
        rv.label = data.get('label', rv.name)
        rv.version = data.get('version', None)

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
    def get(cls, directory, name):
        for form in cls.all(directory):
            if form.name == name:
                return form
        raise KeyError(name)


class Field(Dictionarizable):

    _dictionarizable_attrs = (
        'name', 'label', 'data_type', 'required', 'allows_custom', 'default',
        'constraints', 'preconditions'
    )

    def __init__(
            self, name=None, label=None, data_type=None, required=False,
            allows_custom=False, default=None, constraints=None,
            preconditions=None):

        self.name = name
        self.label = label or name
        self.data_type = data_type
        self.required = required
        self.allows_custom = allows_custom
        self.default = default
        self.constraints = constraints or []
        self.preconditions = preconditions or []

    def __repr__(self):
        return '<Field %r>' % self.label

    @classmethod
    def parse(cls, name, data):
        rv = cls()

        # Parse the required data.
        if 'data_type' not in data:
            raise SyntaxError('field "%s" must have a data type' % name)

        if data['data_type'] == 'int':
            rv.data_type = int
        elif data['data_type'] == 'float':
            rv.data_type = float
        elif data['data_type'] == 'str':
            rv.data_type = str
        else:
            raise SyntaxError('Unknown data type: "%s".' % data['data_type'])

        # Parse the field options.
        if 'options' in data:
            rv.options = [FieldOption.parse(option) for option in data['options']]

        # Parse the field constraints and preconditions.
        rv.constraints = data.get('constraints', [])
        rv.preconditions = data.get('preconditions', [])

        # Parse the optional data.
        rv.name = name
        rv.label = data.get('label', rv.name)
        rv.required = data.get('required', False)
        rv.allows_custom = data.get('allows_custom', False)

        # The default value could be a yaffel expression, so we try to
        # evaluate it first, and we return the value as is if we failed.
        if ('default' in data) and (data['default'] is not None):
            try:
                rv.default = yaffel.parser.parse(data['default'])[1]
            except:
                rv.default = data['default']

        return rv


class FieldOption(Dictionarizable):

    _dictionarizable_attrs = ('value', 'label', 'constraints', 'preconditions')

    def __init__(self, value=None, label=None, constraints=None, preconditions=None):
        self.value = value
        self.label = label or value
        self.constraints = constraints or []
        self.preconditions = preconditions or []

    def __repr__(self):
        return '<Option %r>' % self.label

    @classmethod
    def parse(cls, data):
        rv = cls()

        if isinstance(data, Mapping):
            # The option value could be a yaffel expression, so we try to
            # evaluate it first, and we return the value as is if we failed.
            if 'value' not in data:
                raise SyntaxError('Otions must have a value.')
            try:
                rv.value = yaffel.parser.parse(data['value'])[1]
            except:
                rv.default = data['value']

            # Parse the option constraints and preconditions.
            rv.constraints = data.get('constraints', [])
            rv.preconditions = data.get('preconditions', [])

            # Parse the optional data.
            rv.label = data.get('label', rv.value)

        else:
            rv.value = data
            rv.label = rv.value

        return rv
