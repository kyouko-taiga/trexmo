import yaffel.datatypes

from datetime import datetime

from flask.json import JSONEncoder


class YaffelJsonEncoder(JSONEncoder):

    def default(self, obj):
        try:
            if isinstance(obj, yaffel.datatypes.Enumeration):
                return {
                    'type': type(obj).__module__ + '.' + type(obj).__name__,
                    'elements': obj.elements
                }
            if isinstance(obj, yaffel.datatypes.Range):
                return {
                    'type': type(obj).__module__ + '.' + type(obj).__name__,
                    'lower_bound': obj.lower_bound,
                    'upper_bound': obj.upper_bound
                }
            iterable = iter(obj)
        except TypeError:
            pass
        else:
            return list(iterable)

        return JSONEncoder.default(self, obj)


class TrexmoJsonEncoder(YaffelJsonEncoder):

    def default(self, obj):
        if isinstance(obj, Determinant):
            return self.encode(obj.value)
        return YaffelJsonEncoder.default(self, obj)
