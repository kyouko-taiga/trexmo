from datetime import datetime
from dateutil import tz

from sqlalchemy.types import DateTime, TypeDecorator


class UtcDateTime(TypeDecorator):
    """
    A type decorator that converts any `datetime` to UTC automatically.

    Note that storage of a naive datetime will raise a ValueError.
    See http://stackoverflow.com/questions/2528189
    """

    impl = DateTime

    def __init__(self, *args, **kwargs):
        kwargs['timezone'] = True
        super().__init__(*args, **kwargs)

    def process_bind_param(self, value, engine):
        if value is not None:
            return value.astimezone(tz.tzutc())

    def process_result_value(self, value, engine):
        if value is not None:
            return datetime(
                value.year, value.month, value.day,
                value.hour, value.minute, value.second,
                value.microsecond, tzinfo=value.tzinfo or tz.tzutc())
