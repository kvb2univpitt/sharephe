from flask_wtf import FlaskForm
from wtforms import StringField, SelectField


class PhenotypeForm(FlaskForm):
    '''
    A web form used for displaying Sharephe's read-only workbook.
    '''

    types = [
        ('Clinical Trial', 'Clinical Trial'),
        ('Computable Phenotypes', 'Computable Phenotypes'),
        ('Others', 'Others')
    ]

    workbook_id = StringField('Workbook ID')
    workbook_type = SelectField('Workbook Type', choices=types)
    workbook_title = StringField('Workbook Title')
    workbook_authors = StringField('Main Authors')
    workbook_institution = StringField('Insitution')
