from flask import Blueprint, render_template

views = Blueprint('views', __name__)


@views.route('/')
def index():
    return render_template('index.html')


@views.route('/phenotype')
def phenotype():
    return render_template('phenotype.html')
