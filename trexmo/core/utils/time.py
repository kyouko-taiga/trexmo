from datetime import datetime
from dateutil import tz
from math import floor


def utcnow():
    """Returns the current time in a timezone-aware datetime object."""
    return datetime.now(tz=tz.tzutc())


def unix_timestamp(dt):
    """Returns a UNIX timestamp representing the given datetime."""
    try:
        return floor(dt.timestamp())
    except AttributeError:
        # Handle Python 2.
        dt_naive = dt.replace(tzinfo=None) - dt.utcoffset()
        return floor((dt_naive - datetime(1970, 1, 1)).total_seconds())


def from_unix_timestamp(unix_ts):
    """Returns a datetime from the given UNIX timestamp."""
    return datetime.fromtimestamp(int(unix_ts), tz.tzutc())
