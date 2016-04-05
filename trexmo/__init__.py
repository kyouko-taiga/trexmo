from flask import Flask
from trexmo import settings
from trexmo.blueprints import engine, forms_api
from trexmo.utils import TrexmoJsonEncoder

app = Flask(__name__)
app.json_encoder = TrexmoJsonEncoder

# register blueprints
app.register_blueprint(engine)
app.register_blueprint(forms_api, url_prefix='/forms')

# register custom Jinja filters
@app.template_filter('equal_or_in')
def equal_or_in(x,y):
    try:
        return x == y
    except:
        return x in y
