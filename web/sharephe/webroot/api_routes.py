################################################################################
# File: api_routes.py
# Author: Kevin V. Bui
# Date: February 11, 2023
################################################################################

from .workbook import Workbooks


def initialize_routes(api):
    api.add_resource(Workbooks, '/api/workbook')
