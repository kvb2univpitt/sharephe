################################################################################
# File: sharephe.py
# Author: Kevin V. Bui
# Date: February 11, 2023
################################################################################

from webroot import create_app


app = create_app()


if __name__ == '__sharephe__':
    app.run(debug=True)
