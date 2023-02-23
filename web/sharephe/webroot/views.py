################################################################################
# File: views.py
# Author: Kevin V. Bui
# Date: February 11, 2023
################################################################################

from flask import Blueprint, render_template
from .phenotype_form import PhenotypeForm

views = Blueprint('views', __name__)


@views.route('/')
def index():
    return render_template('index.html')


@views.route('/phenotype')
def phenotype():
    form = PhenotypeForm()

    return render_template('phenotype.html', form=form)
