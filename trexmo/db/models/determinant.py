
class Determinant(object):

    def __init__(self, value, selection=None, exp_selection=None):
        self.value = value
        self.selection = selection or []
        self.exp_selection = exp_selection or []

    def __eq__(self, other):
        try:
            return self.value == other
        except:
            return self.value in other

    def __repr__(self):
        return '<%r %r>' % (self.__class__.__name__, self.value)

    def __str__(self):
        return str(self.value)
