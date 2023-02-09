from .workbook import Workbooks


def initialize_routes(api):
    api.add_resource(Workbooks, '/api/workbook')
