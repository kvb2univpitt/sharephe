################################################################################
# File: term.py
# Author: Kevin V. Bui
# Date: February 28, 2023
################################################################################

from flask_restful import Resource, request

# parser = reqparse.RequestParser()
# parser.add_argument('hlevel', type=int, required=True,
#                     help="Parameter hlevel required!")
# parser.add_argument('parent', type=str, required=True,
#                     help="Parameter parent required!")


class Term(Resource):
    def get(self):
        args = request.args

        resources = {
            'hlevel': args['hlevel'],
            'parent': args['parent']
        }

        return resources
