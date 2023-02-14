from flask_wtf import FlaskForm
from wtforms import StringField, SelectField


class PhenotypeForm(FlaskForm):
    types = [
        ('Clinical Trial', 'Clinical Trial'),
        ('Computable Phenotypes', 'Computable Phenotypes'),
        ('Others', 'Others')
    ]

    workbookId = StringField('Workbook ID')
    workbookType = SelectField('Workbook Type', choices=types)
    workbookTitle = StringField('Workbook Title')
    workbookAuthors = StringField('Main Authors')
    institution = StringField('Insitution')
