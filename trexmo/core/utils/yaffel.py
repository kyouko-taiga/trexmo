from yaffel.parser import tokenize


def yaffelize(arg, datatype=None):
    datatype = datatype or type(arg)
    if issubclass(datatype, str):
        return '"' + (str(arg) if arg is not None else '') + '"'
    else:
        return str(arg)


def parse_variables(expression):
    """Extract the identifiers (variables) from the given expression."""
    return [token.value for token in tokenize(expression) if token.type == 'name']
