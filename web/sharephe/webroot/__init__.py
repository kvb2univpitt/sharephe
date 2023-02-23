################################################################################
# File: __init__.py
# Author: Kevin V. Bui
# Date: February 11, 2023
################################################################################

from flask import Flask
from flask_restful import Api
from flask_moment import Moment

moment = Moment()


def create_app():
    app = Flask(__name__)

    # web form requirement
    app.config['SECRET_KEY'] = '589676422b28a46fd1be0041ce829d0b76d84ed545578fffa4849036c3127a89'

    # initialize date-time
    moment.init_app(app)

    # initialize API URLs
    api = Api(app)
    from .sharephe_api import initialize_routes
    initialize_routes(api)

    # initialize views
    from .views import views
    app.register_blueprint(views, url_prefix='/')

    return app
