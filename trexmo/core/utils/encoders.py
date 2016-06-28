import yaffel.datatypes

from datetime import datetime

from flask.json import JSONEncoder

from trexmo.core.utils.time import unix_timestamp


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
        if isinstance(obj, datetime):
            return unix_timestamp(obj)
        if obj in (int, float, str):
            return str(obj)
        return YaffelJsonEncoder.default(self, obj)
