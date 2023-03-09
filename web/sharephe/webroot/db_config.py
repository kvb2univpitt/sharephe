from enum import Enum

Vendor = Enum('Vendor', ['POSTGRES', 'ORACLE', 'SQL_SERVER'])

db_conn = {
    'vendor': Vendor.POSTGRES,
    'type': 'postgresql+psycopg2',
    'host': 'localhost',
    'database': '',
    'username': '',
    'password': '',
    'metadata_table': 'public.i2b2'
}

# db_conn = {
#     'vendor': Vendor.ORACLE,
#     'type': 'oracle+cx_oracle',
#     'host': 'localhost',
#     'database': '',
#     'username': '',
#     'password': '',
#     'metadata_table': 'i2b2metadata.i2b2'
# }

# db_conn = {
#     'vendor': Vendor.SQL_SERVER,
#     'type': 'mssql+pyodbc',
#     'host': 'localhost',
#     'database': '',
#     'username': '',
#     'password': '',
#     'metadata_table': 'i2b2metadata.dbo.i2b2'
# }
