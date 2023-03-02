Install Virtual Environment
----------------------------------------------
mkdir venv
python3 -m venv venv
source venv/bin/activate
python3 -m pip install --upgrade pip

Dependencies
----------------------------------------------
pip install --upgrade pip
pip install wheel
pip install flask
pip install template-render
pip install flask-blueprint
pip install Flask-RESTful
pip install flask-wtf
pip install flask-moment
pip install boto3

pip install requests

pip install psycopg2-binary
pip install -U Flask-SQLAlchemy

Apache WSGI
----------------------------------------------
/usr/share/httpd/.aws/credentials

Run Development Server
----------------------------------------------
export FLASK_APP=webroot/sharephe.py
export FLASK_DEBUG=1
flask run

history -c;history -w;exit
clear;history -c;history -w
