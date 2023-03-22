################################################################################
# File: term.py
# Author: Kevin V. Bui
# Date: February 28, 2023
################################################################################

from flask_restful import Resource, request
from webroot import db
from .database import get_concepts


class Term(Resource):
    '''
    REST API for i2b2 terminologies.
    '''

    def get(self):
        '''
        GET request for i2b2 terminologies.
        '''

        args = request.args

        return get_concepts(db, args['hlevel'], args['parent'])
