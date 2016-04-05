import os
import yaffel.parser

from collections import Mapping, OrderedDict
from trexmo import settings
from trexmo.utils import ordered_load

class FormDescription(object):

    def __init__(self, filename):
        self.parse(filename)

    def parse(self, filename):
        with open(filename, 'r', encoding='utf-8') as f:
            raw_data = ordered_load(f)

        # required information
        if 'name' not in raw_data:
            raise SyntaxError('form description files must contain a name')
        self.name = raw_data['name']

        # optional general information
        self.label = raw_data.get('label', self.name)
        self.version = raw_data.get('version', None)

        # form fields
        self.fields = OrderedDict()
        for f,g in raw_data.get('fields', {}).items():
            self.fields[f] = FieldDescription(f,g)

    def __getitem__(self, name):
        return self.fields[name]

    def __str__(self):
        rets = 'Form of %s (%s)\n' % (self.name, self.label)
        for field_name, field in self.fields.items():
            rets += '  - ' + str(field)
        return rets

    def as_dict(self):
        return {
            'name': self.name,
            'label': self.label,
            'version': self.version,
            'fields': OrderedDict([(f, g.as_dict()) for f,g in self.fields.items()])
        }

    @classmethod
    def all(cls, directory=None):
        forms = {}
        for filename in os.listdir(directory or settings.FORMS_ROOT_DIR):
            form = cls(os.path.join(directory or settings.FORMS_ROOT_DIR, filename))
            forms[form.name] = form
        return forms

    @classmethod
    def get(cls, name, default=None, directory=None):
        for filename in os.listdir(directory or settings.FORMS_ROOT_DIR):
            form = cls(os.path.join(directory or settings.FORMS_ROOT_DIR, filename))
            if form.name == name:
                return form
        return default

class FieldDescription(object):

    def __init__(self, name, data):
        # required information
        if 'data_type' not in data:
            raise SyntaxError('field "%s" must have a data type' % name)
        if   data['data_type'] == 'int':   self.data_type = int
        elif data['data_type'] == 'float': self.data_type = float
        elif data['data_type'] == 'str':   self.data_type = str

        # optional general information
        self.name = name
        self.label = data.get('label', self.name)
        self.required = data.get('required', False)
        self.allows_custom = data.get('allows_custom', False)
        self._raw_default = data.get('default', self.data_type())

        # field options
        self.options = [FieldOption(opt) for opt in data['options']] if 'options' in data else None

        # field constraints and preconditions
        self.constraints = data.get('constraints', [])
        self.preconditions = data.get('preconditions', [])

    @property
    def default(self):
        # Raw values could be a yaffel expression, so we try to parse them.
        # If the parsing fail, we return the raw value "as is".
        try:
            return yaffel.parser.parse(self._raw_default)[1]
        except:
            return self._raw_default

    def as_dict(self):
        data = {
            'name': self.name,
            'label': self.label,
            'required': self.required,
            'default': self.default,
            'constraints': self.constraints,
            'preconditions': self.preconditions
        }

        if self.options:
            data['options'] = [opt.as_dict() for opt in self.options]
        return data
            

    def __str__(self):
        return '<Field %s:%r>' % (self.data_type.__name__, self.label)

class FieldOption(object):

    def __init__(self, data):
        if isinstance(data, Mapping):
            # required information
            if 'value' not in data:
                raise SyntaxError('options must have a value' % name)
            self._raw_value = data['value']

            # optional general information
            self.label = data.get('label', self.value)

            # option constraints and preconditions
            self.constraints = data.get('constraints', [])
            self.preconditions = data.get('preconditions', [])
        else:
            self.value = data
            self.label = self.value
            self.constraints = []
            self.preconditions = []

    @property
    def value(self):
        # Raw values could be a yaffel expression, so we try to parse them.
        # If the parsing fail, we return the raw value "as is".
        try:
            return yaffel.parser.parse(self._raw_value)[1]
        except:
            return self._raw_value

    def as_dict(self):
        return {
            'value': self.value,
            'label': self.label,
            'constraints': self.constraints,
            'preconditions': self.preconditions
        }

    def __str__(self):
        return '<Option %s (%r)>' % (self.label, self.value)
