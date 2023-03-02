################################################################################
# File: term.py
# Author: Kevin V. Bui
# Date: February 28, 2023
################################################################################

from flask_restful import Resource, request
from webroot import db
from .database import get_concepts


class Term(Resource):
    def get(self):
        args = request.args

        return get_concepts(db, args['hlevel'], args['parent'])
