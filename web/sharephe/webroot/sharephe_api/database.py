################################################################################
# File: database.py
# Author: Kevin V. Bui
# Date: February 11, 2023
################################################################################

from sqlalchemy import text, exc
import logging
from webroot.db_config import db_conn, Vendor

logger = logging.getLogger(__name__)


def get_path(parent):
    '''
    Extract metadata path (column 'c_fullname' of the metadata table).

    For an example, if the input is '\\i2b2_DEMO\i2b2\Demographics\Age\18-34 years old\',
    the path return is '\i2b2\Demographics\Age\18-34 years old\'
    '''

    if parent.startswith('\\'):
        end = parent.index('\\', 3)
        return parent[end:]
    else:
        return parent


def get_concepts(db, hlevel, parent):
    '''
    Get metadata concepts.

    :param db: database connection
    :param hlevel: number of depth (children) to fetch.  The value -1 means unlimited depth.
    :param parent: the path (c_fullname) of the parent.
    '''

    path = get_path(parent)

    # add extra backslash for postgres database
    if (db_conn['vendor'] == Vendor.POSTGRES):
        path = path.replace('\\', '\\\\')

    table = db_conn['metadata_table']
    sql = f"SELECT c_fullname,c_name,c_basecode FROM {table} WHERE c_fullname like '{path}%' AND c_hlevel > {hlevel} AND c_visualattributes NOT LIKE '_H%' AND c_synonym_cd = 'N' ORDER BY c_hlevel,upper(c_name)"
    try:
        result = db.session.execute(text(sql))
    except exc.SQLAlchemyError as err:
        logger.error(
            "Couldn't fetch concepts: %s: %s",
            err.response['Error']['Code'], err.response['Error']['Message'])
        raise

    resources = []
    if (result):
        for row in result:
            c_name = row[0]
            c_name = row[1]
            c_basecode = row[2]
            if (c_name and c_basecode and c_name):
                resources.append({
                    'name': c_name.replace('"', '').strip(),
                    'key': c_name.replace('"', '').strip(),
                    'basecode': c_basecode.replace('"', '').strip()
                })

    return resources
