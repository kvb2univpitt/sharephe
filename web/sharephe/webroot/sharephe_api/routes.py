################################################################################
# File: routes.py
# Author: Kevin V. Bui
# Date: February 11, 2023
################################################################################

from .workbook import Workbooks
from .workbook import WorkbookById


def initialize_routes(api):
    api.add_resource(Workbooks, '/api/workbook')
    api.add_resource(WorkbookById, '/api/workbook/<string:phenotypeId>')
