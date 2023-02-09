from flask import Flask
from flask_restful import Api


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'secret'
    api_routes = Api(app)

    from .views import views
    app.register_blueprint(views, url_prefix='/')

    from .api_routes import initialize_routes
    initialize_routes(api_routes)

    return app
