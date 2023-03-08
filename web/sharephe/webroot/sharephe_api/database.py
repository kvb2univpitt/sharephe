from sqlalchemy import text, exc
import logging

logger = logging.getLogger(__name__)


def get_path(parent):
    end = parent.index('\\', 3)

    return parent[end:]


def get_concepts(db, hlevel, parent):
    path = get_path(parent)
    path = path.replace('\\', '\\\\')
    table = 'sharephe_metadata'

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
                    'name': c_name.strip(),
                    'key': c_name.strip(),
                    'basecode': c_basecode.strip()
                })

    return resources
